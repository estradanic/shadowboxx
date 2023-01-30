/** Function to update references to a user's email address when it changes */
const updateEmail = async (user: Parse.User) => {
  console.log("Updating email for user", user.id, "to", user.get("email"));
  const oldUser = await new Parse.Query(Parse.User)
    .equalTo("objectId", user.id)
    .first({ useMasterKey: true });

  if (!oldUser) {
    throw new Parse.Error(404, "User not found");
  }

  console.log("Old email", oldUser.get("email"));

  const oldEmail = oldUser.get("email");
  const newEmail = user.get("email");

  if (oldEmail === newEmail) {
    console.log("Emails are the same, no need to update");
    return;
  }

  console.log("Getting albums referencing old email for user", user.id);
  const albumsReferencingOldEmail = await Parse.Query.or(
    new Parse.Query("Album").contains("collaborators", oldEmail),
    new Parse.Query("Album").contains("viewers", oldEmail)
  ).find({ useMasterKey: true });

  console.log("Updating albums referencing old email for user", user.id);
  for (const album of albumsReferencingOldEmail) {
    console.log("Updating album", album.get("name"));
    const collaborators = album.get("collaborators");
    const viewers = album.get("viewers");
    album.set(
      "collaborators",
      collaborators.map((email: string) =>
        email === oldEmail ? newEmail : email
      )
    );
    album.set(
      "viewers",
      viewers.map((email: string) => (email === oldEmail ? newEmail : email))
    );
    await album.save(null, {
      useMasterKey: true,
      context: { noTrigger: true },
    });
    console.log("Updated album", album.get("name"));
  }
  console.log("Updated albums referencing old email for user", user.id);
};

export default updateEmail;
