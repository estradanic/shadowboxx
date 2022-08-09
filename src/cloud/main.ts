import sharp from "sharp";

/* #region afterSaves */

const setPermissionsOnAlbum = async (album: Parse.Object<Parse.Attributes>) => {
  const owner = await new Parse.Query(Parse.User)
    .equalTo("objectId", album.get("owner").id)
    .first({ useMasterKey: true });
  const readRoleName = `${album.id}_r`;
  const readWriteRoleName = `${album.id}_rw`;
  let readRole = new Parse.Role(readRoleName, new Parse.ACL());
  let readWriteRole = new Parse.Role(readWriteRoleName, new Parse.ACL());
  if (album.existed()) {
    readRole =
      (await new Parse.Query(Parse.Role)
        .equalTo("name", readRoleName)
        .first({ useMasterKey: true })) ?? readRole;
    readWriteRole =
      (await new Parse.Query(Parse.Role)
        .equalTo("name", readWriteRoleName)
        .first({ useMasterKey: true })) ?? readWriteRole;
  }

  if (album.get("viewers").length > 0) {
    const viewers = await new Parse.Query(Parse.User)
      .containedIn("email", album.get("viewers"))
      .find({ useMasterKey: true });
    readRole.getUsers().add(viewers);
  }
  if (album.get("collaborators").length > 0) {
    const collaborators = await new Parse.Query(Parse.User)
      .containedIn("email", album.get("collaborators"))
      .find({ useMasterKey: true });
    readWriteRole.getUsers().add(collaborators);
  }

  readWriteRole.getUsers().add(owner!);
  await readRole.save(null, { useMasterKey: true });
  await readWriteRole.save(null, { useMasterKey: true });

  if (album.get("images").length > 0) {
    const images = await new Parse.Query("Image")
      .containedIn("objectId", album.get("images"))
      .find({ useMasterKey: true });
    images.forEach((image) => {
      let imageACL = image.getACL() ?? new Parse.ACL();
      imageACL.setReadAccess(owner!, true);
      imageACL.setWriteAccess(owner!, true);
      imageACL.setRoleReadAccess(readRole, true);
      imageACL.setRoleReadAccess(readWriteRole, true);
      imageACL.setRoleWriteAccess(readWriteRole, true);
      image.setACL(imageACL);
    });
    await Parse.Object.saveAll(images, { useMasterKey: true });
  }

  if (!album.get("hasAppliedRoles")) {
    const albumACL = new Parse.ACL();
    albumACL.setReadAccess(owner!, true);
    albumACL.setWriteAccess(owner!, true);
    albumACL.setRoleReadAccess(readRole, true);
    albumACL.setRoleReadAccess(readWriteRole, true);
    albumACL.setRoleWriteAccess(readWriteRole, true);
    album.setACL(albumACL);
    album.set("hasAppliedRoles", true);
    await album.save(null, { useMasterKey: true });
  }
};

const setAlbumPermissionsForUser = async (
  user: Parse.User<Parse.Attributes>
) => {
  if (!user.existed()) {
    const collaboratorAlbums = await new Parse.Query("Album")
      .containsAll("collaborators", [user.getEmail()])
      .find({ useMasterKey: true });
    const viewerAlbums = await new Parse.Query("Album")
      .containsAll("viewers", [user.getEmail()])
      .find({ useMasterKey: true });
    if (collaboratorAlbums.length > 0) {
      const readWriteRoleNames = collaboratorAlbums.map(
        (album) => `${album.id}_rw`
      );
      const readWriteRoles = await new Parse.Query(Parse.Role)
        .containedIn("name", readWriteRoleNames)
        .find({ useMasterKey: true });
      readWriteRoles.forEach((role) => {
        role.getUsers().add(user);
      });
      await Parse.Role.saveAll(readWriteRoles, { useMasterKey: true });
    }
    if (viewerAlbums.length > 0) {
      const readRoleNames = viewerAlbums.map((album) => `${album.id}_r`);
      const readRoles = await new Parse.Query(Parse.Role)
        .containedIn("name", readRoleNames)
        .find({ useMasterKey: true });
      readRoles.forEach((role) => {
        role.getUsers().add(user);
      });
      await Parse.Role.saveAll(readRoles, { useMasterKey: true });
    }
  }
};

Parse.Cloud.afterSave("Album", async (request) => {
  await setPermissionsOnAlbum(request.object);
});

Parse.Cloud.afterSave(Parse.User, async (request) => {
  await setAlbumPermissionsForUser(request.object);
});

/* #endregion */

/* #region beforeSaves */

const saveImageInMultipleSizes = async (
  image: Parse.Object<Parse.Attributes>
) => {
  if (
    !!image.get("file") &&
    (image.dirty("file") || !image.get("fileThumb") || !image.get("fileMobile"))
  ) {
    const { buffer } = await Parse.Cloud.httpRequest({
      url: image.get("file").url(),
    });
    const thumbnail = (
      await sharp(buffer).resize(64).webp().toBuffer()
    ).toString("base64");
    const mobile = (await sharp(buffer).resize(900).webp().toBuffer()).toString(
      "base64"
    );
    const original = (await sharp(buffer).webp().toBuffer()).toString("base64");
    image.set(
      "file",
      await new Parse.File(image.get("name") + ".webp", {
        base64: original,
      }).save()
    );
    image.set(
      "fileThumb",
      await new Parse.File(image.get("name") + "_thumb.webp", {
        base64: thumbnail,
      }).save()
    );
    image.set(
      "fileMobile",
      await new Parse.File(image.get("name") + "_mobile.wepb", {
        base64: mobile,
      }).save()
    );
  }
};

Parse.Cloud.beforeSave("Image", async (request) => {
  await saveImageInMultipleSizes(request.object);
});

/* #endregion */

/* #region beforeDeletes */

const deleteRolesForAlbum = async (album: Parse.Object<Parse.Attributes>) => {
  const readRole = await new Parse.Query(Parse.Role)
    .equalTo("name", `${album.id}_r`)
    .first({ useMasterKey: true });
  const readWriteRole = await new Parse.Query(Parse.Role)
    .equalTo("name", `${album.id}_rw`)
    .first({ useMasterKey: true });

  if (readRole) {
    await readRole.destroy({ useMasterKey: true });
  }
  if (readWriteRole) {
    await readWriteRole.destroy({ useMasterKey: true });
  }
};

Parse.Cloud.beforeDelete("Album", async (request) => {
  await deleteRolesForAlbum(request.object);
});

/* #endregion */
