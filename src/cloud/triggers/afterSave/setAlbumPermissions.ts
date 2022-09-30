/** Function to get all images in this album */
const getAllImages = async (album: Parse.Object) => {
  const images = [];
  let exhausted = false;
  let offset = 0;
  const limit = 1000;
  while (!exhausted) {
    const partialImages = await new Parse.Query("Image")
      .containedIn("objectId", album.get("images"))
      .limit(limit)
      .skip(offset)
      .find({ useMasterKey: true });
    if (partialImages.length === 0) {
      exhausted = true;
    } else {
      images.push(...partialImages);
      offset += limit;
    }
  }
  return images;
};

/** Function to get all users by their emails */
const getAllUsersByEmails = async (emails: string[]) => {
  const users = [];
  let exhausted = false;
  let offset = 0;
  const limit = 1000;
  while (!exhausted) {
    const partialUsers = await new Parse.Query(Parse.User)
      .containedIn("email", emails)
      .limit(limit)
      .skip(offset)
      .find({ useMasterKey: true });
    if (partialUsers.length === 0) {
      exhausted = true;
    } else {
      users.push(...partialUsers);
      offset += limit;
    }
  }
  return users;
};

/** Function to set permissions for this album and the images within it */
const setAlbumPermissions = async (album: Parse.Object) => {
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
    const viewers = await getAllUsersByEmails(album.get("viewers"));
    readRole.getUsers().add(viewers);
  }
  if (album.get("collaborators").length > 0) {
    const collaborators = await getAllUsersByEmails(album.get("collaborators"));
    readWriteRole.getUsers().add(collaborators);
  }

  readWriteRole.getUsers().add(owner!);
  await readRole.save(null, { useMasterKey: true });
  await readWriteRole.save(null, { useMasterKey: true });

  if (album.get("images").length > 0) {
    const images = await getAllImages(album);
    images.forEach((image) => {
      let imageACL = image.getACL() ?? new Parse.ACL();
      imageACL.setReadAccess(owner!, true);
      imageACL.setWriteAccess(owner!, true);
      imageACL.setRoleReadAccess(readRole, true);
      imageACL.setRoleReadAccess(readWriteRole, true);
      imageACL.setRoleWriteAccess(readWriteRole, true);
      image.setACL(imageACL);
    });
    await Promise.all(
      images.map((image) =>
        image.save(null, { useMasterKey: true, context: { noTrigger: true } })
      )
    );
  }

  const albumACL = new Parse.ACL();
  albumACL.setReadAccess(owner!, true);
  albumACL.setWriteAccess(owner!, true);
  albumACL.setRoleReadAccess(readRole, true);
  albumACL.setRoleReadAccess(readWriteRole, true);
  albumACL.setRoleWriteAccess(readWriteRole, true);
  album.setACL(albumACL);
  await album.save(null, { useMasterKey: true, context: { noTrigger: true } });
};

export default setAlbumPermissions;
