import { User } from "../../../types";

const setUserPermissions = async (user: Parse.User<User>) => {
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

export default setUserPermissions;
