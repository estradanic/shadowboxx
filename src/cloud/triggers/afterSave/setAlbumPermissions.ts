import { Album } from "../../../types";

const setAlbumPermissions = async (album: Parse.Object<Album>) => {
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

export default setAlbumPermissions;
