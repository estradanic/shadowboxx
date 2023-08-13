import loggerWrapper from "../../loggerWrapper";
import {
  getObjectId,
  ParseAlbum,
  ParseAlbumChangeNotification,
  ParseUser,
  distinctBy,
} from "../../shared";
import { UnpersistedParseAlbumChangeNotification } from "../../shared/classes/ParseAlbumChangeNotification";

/** Function to add notifications that an album has changed */
const notifyOfAlbumChange = async (album: ParseAlbum, user?: ParseUser) => {
  if (!user || !album) {
    return;
  }
  console.log("Getting album owner");
  const albumOwner = await ParseUser.cloudQuery(Parse).get(
    getObjectId(album.owner),
    { useMasterKey: true }
  );
  console.log("Getting users to notify of album change");
  const usersToNotify = distinctBy(
    (
      await ParseUser.cloudQuery(Parse)
        .containedIn(ParseUser.COLUMNS.email, [
          ...album.viewers,
          ...album.collaborators,
          albumOwner.email,
        ])
        .find({ useMasterKey: true })
    ).filter((u) => u.objectId !== user?.objectId),
    getObjectId
  );
  console.log("Got users to notify", { usersToNotify });
  if (usersToNotify.length === 0) {
    return;
  }
  console.log("Getting existing notifications");
  const existingNotifications = await ParseAlbumChangeNotification.cloudQuery(
    Parse
  )
    .containedIn(
      ParseAlbumChangeNotification.COLUMNS.owner,
      usersToNotify.map((u) => u.toNativePointer())
    )
    .equalTo(
      ParseAlbumChangeNotification.COLUMNS.album,
      album.toNativePointer()
    )
    .equalTo(ParseAlbumChangeNotification.COLUMNS.user, user.toNativePointer())
    .find({ useMasterKey: true });
  console.log("Got existing notifications", { existingNotifications });
  console.log("Creating/updating notifications");
  for (const userToNotify of usersToNotify) {
    console.log("Creating/updating notification for user", { userToNotify });
    const existingNotification = existingNotifications.find(
      (notification) =>
        getObjectId(notification.owner) === getObjectId(userToNotify)
    );
    if (existingNotification) {
      console.log("Updating existing notification", { existingNotification });
      existingNotification.count += 1;
      await existingNotification.save({ useMasterKey: true });
      console.log("Updated existing notification", { existingNotification });
    } else {
      console.log("Creating new notification");
      const notification = new UnpersistedParseAlbumChangeNotification({
        owner: userToNotify.toPointer(),
        user: user.toPointer(),
        album: album.toPointer(),
        count: 1,
      });
      await notification.save({ useMasterKey: true });
      console.log("Created new notification", { notification });
    }
  }
  console.log("Created/updated notifications");
};

export default loggerWrapper("notifyOfAlbumChange", notifyOfAlbumChange);
