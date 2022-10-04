/** Function to set user permissions for albums */
const setUserPermissions = async (user: Parse.User) => {
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
      await Promise.all(readWriteRoles.map((role) => role.save(null, {useMasterKey: true, context: {noTrigger: true}})));
    }
    if (viewerAlbums.length > 0) {
      const readRoleNames = viewerAlbums.map((album) => `${album.id}_r`);
      const readRoles = await new Parse.Query(Parse.Role)
        .containedIn("name", readRoleNames)
        .find({ useMasterKey: true });
      readRoles.forEach((role) => {
        role.getUsers().add(user);
      });
      await Promise.all(readRoles.map((role) => role.save(null, {useMasterKey: true, context: {noTrigger: true}})));
    }
  }
};

export default setUserPermissions;
