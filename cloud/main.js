const sharp = require("sharp");

async function addCollaboratorAccess(album, albumACL, imageACL) {
  try {
    if (album.get("collaborators") && album.get("collaborators").length) {
      const collaborators = await new Parse.Query("User")
        .containedIn("email", album.get("collaborators"))
        .findAll({ useMasterKey: true });
      for (const collaborator of collaborators) {
        albumACL.setReadAccess(collaborator, true);
        albumACL.setWriteAccess(collaborator, true);
        imageACL.setReadAccess(collaborator, true);
        imageACL.setWriteAccess(collaborator, true);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function addViewerAccess(album, albumACL, imageACL) {
  try {
    if (album.get("viewers") && album.get("viewers").length) {
      const viewers = await new Parse.Query("User")
        .containedIn("email", album.get("viewers"))
        .findAll({ useMasterKey: true });
      for (const viewer of viewers) {
        albumACL.setReadAccess(viewer, true);
        imageACL.setReadAccess(viewer, true);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function setImageACL(album, imageACL) {
  try {
    const images = await new Parse.Query("Image")
      .containedIn("objectId", album.get("images"))
      .findAll({ useMasterKey: true });
    for (const image of images) {
      image.setACL(imageACL);
    }
    await Parse.Object.saveAll(images, { useMasterKey: true });
  } catch (e) {
    console.error(e);
  }
}

Parse.Cloud.beforeSave("Album", async (request) => {
  try {
    const album = request.object;
    const owner = await new Parse.Query("User").get(
      album.get("owner").objectId ?? album.get("owner").id
    );
    const albumACL = new Parse.ACL(owner);
    const imageACL = new Parse.ACL(owner);
    if (album.get("isPublic")) {
      albumACL.setPublicReadAccess(true);
      imageACL.setPublicReadAccess(true);
    }
    await addCollaboratorAccess(album, albumACL, imageACL);
    await addViewerAccess(album, albumACL, imageACL);
    await setImageACL(album, imageACL);
    album.setACL(albumACL);
  } catch (e) {
    console.error(e);
  }
});

Parse.Cloud.beforeSave("Image", async (request) => {
  const image = request.object;
  if (
    !!image.get("file") &&
    (image.dirty("file") || !image.get("fileThumb") || !image.get("fileMobile"))
  ) {
    try {
      const { buffer } = await Parse.Cloud.httpRequest({
        url: image.get("file").url(),
      });
      const thumbnail = (
        await sharp(buffer).resize(64).webp().toBuffer()
      ).toString("base64");
      const mobile = (
        await sharp(buffer).resize(900).webp().toBuffer()
      ).toString("base64");
      const original = (await sharp(buffer).webp().toBuffer()).toString(
        "base64"
      );
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
    } catch (e) {
      console.error(e);
    }
  }
});
