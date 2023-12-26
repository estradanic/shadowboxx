import loggerWrapper from "../../loggerWrapper";
import { ParseAlbum, ParseQuery, ParseUser, Strings } from "../../shared";

/** Function to update references to a user's email address when it changes */
const updateEmail = async (user: ParseUser) => {
  console.log("Updating email for user", user.objectId, "to", user.email);
  const oldUser = await ParseUser.cloudQuery(Parse)
    .equalTo(ParseUser.COLUMNS.objectId, user.objectId)
    .first({ useMasterKey: true });

  if (!oldUser) {
    throw new Parse.Error(
      Parse.Error.OBJECT_NOT_FOUND,
      Strings.cloud.error.userNotFound
    );
  }

  if (!oldUser.email) {
    console.log("Old email doesn't exist, No need to update");
    return;
  }

  console.log("Old email", oldUser.email);

  const oldEmail = oldUser.email;
  const newEmail = user.email;

  if (oldEmail === newEmail) {
    console.log("Emails are the same, no need to update");
    return;
  }

  console.log("Getting albums referencing old email for user", user.objectId);
  const albumsReferencingOldEmail = await ParseQuery.or(
    ParseAlbum.cloudQuery(Parse).contains(
      ParseAlbum.COLUMNS.collaborators,
      oldEmail
    ),
    ParseAlbum.cloudQuery(Parse).contains(ParseAlbum.COLUMNS.viewers, oldEmail)
  ).find({ useMasterKey: true });

  console.log("Updating albums referencing old email for user", user.objectId);
  for (const album of albumsReferencingOldEmail) {
    console.log("Updating album", album.name);
    const collaborators = album.collaborators;
    const viewers = album.viewers;
    album.collaborators = collaborators.map((email: string) =>
      email === oldEmail ? newEmail : email
    );
    album.viewers = viewers.map((email: string) =>
      email === oldEmail ? newEmail : email
    );

    await album.cloudSave({
      useMasterKey: true,
      context: { noTrigger: true },
    });
    console.log("Updated album", album.name);
  }
  console.log("Updated albums referencing old email for user", user.objectId);
};

export default loggerWrapper("updateEmail", updateEmail);
