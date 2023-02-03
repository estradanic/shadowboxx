export type UndoEmailChangeParams = {
  email: string;
};

/** Function to undo email change */
const undoEmailChange = async ({ email }: UndoEmailChangeParams) => {
  const user = await new Parse.Query(Parse.User)
    .equalTo("email", email)
    .first({ useMasterKey: true });

  if (!user) {
    throw new Parse.Error(404, "User not found");
  }
  if (!user.get("oldEmail")) {
    throw new Parse.Error(400, "No previous email found.");
  }

  user.set("email", user.get("oldEmail"));
  user.set("oldEmail", null);
  user.set("verificationCode", null);
  user.save(null, { useMasterKey: true, context: { noTrigger: true } });
};

export default undoEmailChange;
