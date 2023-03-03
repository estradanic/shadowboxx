import loggerWrapper from "../../loggerWrapper";
import {
  getObjectId,
  NativeAttributes,
  ParseAlbum,
  ParseAlbumChangeNotification,
  ParseUser,
} from "../../shared";

/** Function to add notifications that an album has changed */
const notifyOfAlbumChange = async (
  album: Parse.Object<NativeAttributes<"Album">>,
  user?: Parse.User<NativeAttributes<"_User">>
) => {
  if (!user || !album) {
    return;
  }
  console.log("Getting album owner");
  const albumOwner = await ParseUser.cloudQuery(Parse).get(
    getObjectId(album.get(ParseAlbum.COLUMNS.owner)),
    { useMasterKey: true }
  );
  console.log("Getting users to notify of album change");
  const usersToNotify = (
    await ParseUser.cloudQuery(Parse)
      .containedIn(ParseUser.COLUMNS.email, [
        ...album.get(ParseAlbum.COLUMNS.viewers),
        ...album.get(ParseAlbum.COLUMNS.collaborators),
        albumOwner.get(ParseUser.COLUMNS.email),
      ])
      .find({ useMasterKey: true })
  )
    .filter((u) => u.id !== user?.id)
    .map((u) => u.toPointer());
  console.log("Got users to notify", { usersToNotify });
  if (usersToNotify.length === 0) {
    return;
  }
  console.log("Getting existing notifications");
  const existingNotifications = await ParseAlbumChangeNotification.cloudQuery(
    Parse
  )
    .containedIn(ParseAlbumChangeNotification.COLUMNS.owner, usersToNotify)
    .equalTo(ParseAlbumChangeNotification.COLUMNS.album, album.toPointer())
    .equalTo(ParseAlbumChangeNotification.COLUMNS.user, user.toPointer())
    .find({ useMasterKey: true });
  console.log("Got existing notifications", { existingNotifications });
  console.log("Creating/updating notifications");
  for (const userToNotify of usersToNotify) {
    console.log("Creating/updating notification for user", { userToNotify });
    const existingNotification = existingNotifications.find(
      (notification) =>
        getObjectId(
          notification.get(ParseAlbumChangeNotification.COLUMNS.owner)
        ) === getObjectId(userToNotify)
    );
    if (existingNotification) {
      console.log("Updating existing notification", { existingNotification });
      existingNotification.increment("count");
      await existingNotification.save(null, { useMasterKey: true });
      console.log("Updated existing notification", { existingNotification });
    } else {
      console.log("Creating new notification");
      const notification = new Parse.Object<
        NativeAttributes<"AlbumChangeNotification">
      >("AlbumChangeNotification", {
        owner: userToNotify,
        user: user.toPointer(),
        album: album.toPointer(),
        count: 1,
      });
      await notification.save(null, { useMasterKey: true });
      console.log("Created new notification", { notification });
    }
  }
  console.log("Created/updated notifications");
};

export default loggerWrapper("notifyOfAlbumChange", notifyOfAlbumChange);
