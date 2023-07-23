import loggerWrapper from "../loggerWrapper";
import { ParseUser, Strings } from "../shared";

export type UndoEmailChangeParams = {
  email: string;
};

/** Function to undo email change */
const undoEmailChange = async ({ email }: UndoEmailChangeParams) => {
  const user = await ParseUser.cloudQuery(Parse)
    .equalTo(ParseUser.COLUMNS.email, email)
    .first({ useMasterKey: true });

  if (!user) {
    throw new Parse.Error(
      Parse.Error.REQUEST_LIMIT_EXCEEDED,
      Strings.cloud.error.userNotFound
    );
  }
  const oldEmail = user.oldEmail;
  if (!oldEmail) {
    throw new Parse.Error(
      Parse.Error.INVALID_QUERY,
      Strings.cloud.error.noPreviousEmailFound
    );
  }

  user.email = oldEmail;
  user.oldEmail = undefined;
  user.verificationCode = undefined;
  user.save({ useMasterKey: true, context: { noTrigger: true } });
};

export default loggerWrapper("undoEmailChange", undoEmailChange);
