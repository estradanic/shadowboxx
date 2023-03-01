import { ParseUser, Strings } from "../shared";

export type UndoEmailChangeParams = {
  email: string;
};

/** Function to undo email change */
const undoEmailChange = async ({ email }: UndoEmailChangeParams) => {
  const user = await ParseUser.query()
    .equalTo(ParseUser.COLUMNS.email, email)
    .first({ useMasterKey: true });

  if (!user) {
    throw new Parse.Error(404, Strings.cloud.error.userNotFound);
  }
  const oldEmail = user.get(ParseUser.COLUMNS.oldEmail);
  if (!oldEmail) {
    throw new Parse.Error(400, Strings.cloud.error.noPreviousEmailFound);
  }

  user.set(ParseUser.COLUMNS.email, oldEmail);
  user.set(ParseUser.COLUMNS.oldEmail, undefined);
  user.set(ParseUser.COLUMNS.verificationCode, undefined);
  user.save(null, { useMasterKey: true, context: { noTrigger: true } });
};

export default undoEmailChange;
