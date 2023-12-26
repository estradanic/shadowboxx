import loggerWrapper from "../../loggerWrapper";
import { ParseUser, ParseAlbum } from "../../shared";

/** Function to set user permissions for albums */
const setUserPermissions = async (user: ParseUser) => {
  if (!user.existed()) {
    const collaboratorAlbums = await ParseAlbum.cloudQuery(Parse)
      .containsAll(ParseAlbum.COLUMNS.collaborators, [user.email])
      .find({ useMasterKey: true });
    const viewerAlbums = await ParseAlbum.cloudQuery(Parse)
      .containsAll(ParseAlbum.COLUMNS.viewers, [user.email])
      .find({ useMasterKey: true });
    if (collaboratorAlbums.length > 0) {
      const readWriteRoleNames = collaboratorAlbums.map(
        (album) => `${album.objectId}_rw`
      );
      const readWriteRoles = await new Parse.Query(Parse.Role)
        .containedIn("name", readWriteRoleNames)
        .find({ useMasterKey: true });
      readWriteRoles.forEach((role) => {
        role.getUsers().add(user.toNative());
      });
      await Promise.all(
        readWriteRoles.map((role) =>
          role.save(null, { useMasterKey: true, context: { noTrigger: true } })
        )
      );
    }
    if (viewerAlbums.length > 0) {
      const readRoleNames = viewerAlbums.map((album) => `${album.objectId}_r`);
      const readRoles = await new Parse.Query(Parse.Role)
        .containedIn("name", readRoleNames)
        .find({ useMasterKey: true });
      readRoles.forEach((role) => {
        role.getUsers().add(user.toNative());
      });
      await Promise.all(
        readRoles.map((role) =>
          role.save(null, { useMasterKey: true, context: { noTrigger: true } })
        )
      );
    }
  }
};

export default loggerWrapper("setUserPermissions", setUserPermissions);
