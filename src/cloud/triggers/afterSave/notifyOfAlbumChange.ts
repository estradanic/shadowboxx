/** Function to add notifications that an album has changed */
const notifyOfAlbumChange = async (album: Parse.Object, user?: Parse.User) => {
  console.log("Getting users to notify of album change");
  const usersToNotify = (
    await new Parse.Query(Parse.User)
      .containedIn("email", [
        ...album.get("viewers"),
        ...album.get("collaborators"),
        (await album.get("owner").fetch({ useMasterKey: true })).get("email"),
      ])
      .find({ useMasterKey: true })
  ).filter((u) => u.id !== user?.id);
  console.log("Got users to notify", { usersToNotify });
  if (usersToNotify.length === 0) {
    return;
  }
  console.log("Getting existing notifications");
  const existingNotifications = await new Parse.Query("AlbumChangeNotification")
    .containedIn("owner", usersToNotify)
    .equalTo("album", album)
    .equalTo("user", user)
    .find({ useMasterKey: true });
  console.log("Got existing notifications", { existingNotifications });
  console.log("Creating/updating notifications");
  for (const userToNotify of usersToNotify) {
    console.log("Creating/updating notification for user", { userToNotify });
    const existingNotification = existingNotifications.find(
      (notification) => notification.get("owner").id === userToNotify.id
    );
    if (existingNotification) {
      console.log("Updating existing notification", { existingNotification });
      existingNotification.increment("count");
      await existingNotification.save(null, { useMasterKey: true });
      console.log("Updated existing notification", { existingNotification });
    } else {
      console.log("Creating new notification");
      const notification = new Parse.Object("AlbumChangeNotification");
      notification.set("owner", userToNotify);
      notification.set("user", user);
      notification.set("album", album);
      notification.set("count", 1);
      await notification.save(null, { useMasterKey: true });
      console.log("Created new notification", { notification });
    }
  }
  console.log("Created/updated notifications");
};

export default notifyOfAlbumChange;
