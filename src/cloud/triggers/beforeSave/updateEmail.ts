import { NativeAttributes, ParseAlbum, ParseUser, Strings } from "../../shared";

/** Function to update references to a user's email address when it changes */
const updateEmail = async (user: Parse.User<NativeAttributes<"_User">>) => {
  console.log(
    "Updating email for user",
    user.id,
    "to",
    user.get(ParseUser.COLUMNS.email)
  );
  const oldUser = await ParseUser.query()
    .equalTo(ParseUser.COLUMNS.objectId, user.id)
    .first({ useMasterKey: true });

  if (!oldUser) {
    throw new Parse.Error(404, Strings.cloud.error.userNotFound);
  }

  console.log("Old email", oldUser.get(ParseUser.COLUMNS.email));

  const oldEmail = oldUser.get(ParseUser.COLUMNS.email);
  const newEmail = user.get(ParseUser.COLUMNS.email);

  if (oldEmail === newEmail) {
    console.log("Emails are the same, no need to update");
    return;
  }

  console.log("Getting albums referencing old email for user", user.id);
  const albumsReferencingOldEmail = await Parse.Query.or(
    ParseAlbum.query().contains(ParseAlbum.COLUMNS.collaborators, oldEmail),
    ParseAlbum.query().contains(ParseAlbum.COLUMNS.viewers, oldEmail)
  ).find({ useMasterKey: true });

  console.log("Updating albums referencing old email for user", user.id);
  for (const album of albumsReferencingOldEmail) {
    console.log("Updating album", album.get(ParseAlbum.COLUMNS.name));
    const collaborators = album.get(ParseAlbum.COLUMNS.collaborators);
    const viewers = album.get(ParseAlbum.COLUMNS.viewers);
    album.set(
      ParseAlbum.COLUMNS.collaborators,
      collaborators.map((email: string) =>
        email === oldEmail ? newEmail : email
      )
    );
    album.set(
      ParseAlbum.COLUMNS.viewers,
      viewers.map((email: string) => (email === oldEmail ? newEmail : email))
    );
    await album.save(null, {
      useMasterKey: true,
      context: { noTrigger: true },
    });
    console.log("Updated album", album.get(ParseAlbum.COLUMNS.name));
  }
  console.log("Updated albums referencing old email for user", user.id);
};

export default updateEmail;
