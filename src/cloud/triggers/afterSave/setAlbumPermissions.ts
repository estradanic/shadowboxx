import loggerWrapper from "../../loggerWrapper";
import { getObjectId, ParseAlbum, ParseImage, ParseUser } from "../../shared";

/** Function to get all images in this album */
const getAllImages = async (album: ParseAlbum) => {
  const images = [];
  let exhausted = false;
  let offset = 0;
  const limit = 1000;
  while (!exhausted) {
    const partialImages = await ParseImage.cloudQuery(Parse)
      .containedIn(ParseImage.COLUMNS.objectId, album.images)
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
    const partialUsers = await ParseUser.cloudQuery(Parse)
      .containedIn(ParseUser.COLUMNS.email, emails)
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
const setAlbumPermissions = async (album: ParseAlbum) => {
  const owner = await ParseUser.cloudQuery(Parse)
    .equalTo(ParseUser.COLUMNS.objectId, getObjectId(album.owner))
    .first({ useMasterKey: true });
  const readRoleName = `${album.objectId}_r`;
  const readWriteRoleName = `${album.objectId}_rw`;
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

  if (album.viewers.length > 0) {
    const viewers = await getAllUsersByEmails(album.viewers);
    readRole.getUsers().add(viewers.map((v) => v.toNative()));
  }
  if (album.collaborators.length > 0) {
    const collaborators = await getAllUsersByEmails(album.collaborators);
    readWriteRole.getUsers().add(collaborators.map((c) => c.toNative()));
  }

  const albumACL = new Parse.ACL();

  if (owner) {
    readWriteRole.getUsers().add(owner.toNative());
    if (album.images.length > 0) {
      const images = await getAllImages(album);
      images.forEach((image) => {
        let imageACL = image.getACL() ?? new Parse.ACL();
        imageACL.setReadAccess(owner.toNative(), true);
        imageACL.setWriteAccess(owner.toNative(), true);
        imageACL.setRoleReadAccess(readRole, true);
        imageACL.setRoleReadAccess(readWriteRole, true);
        imageACL.setRoleWriteAccess(readWriteRole, true);
        image.setACL(imageACL);
      });
      await Promise.all(
        images.map((image) =>
          image.cloudSave({ useMasterKey: true, context: { noTrigger: true } })
        )
      );
      albumACL.setReadAccess(owner.toNative(), true);
      albumACL.setWriteAccess(owner.toNative(), true);
    }
  }
  await readRole.save(null, {
    useMasterKey: true,
    context: { noTrigger: true },
  });
  await readWriteRole.save(null, {
    useMasterKey: true,
    context: { noTrigger: true },
  });

  albumACL.setRoleReadAccess(readRole, true);
  albumACL.setRoleReadAccess(readWriteRole, true);
  albumACL.setRoleWriteAccess(readWriteRole, true);
  album.setACL(albumACL);
  await album.cloudSave({ useMasterKey: true, context: { noTrigger: true } });
};

export default loggerWrapper("setAlbumPermissions", setAlbumPermissions);
