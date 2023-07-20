import loggerWrapper from "../loggerWrapper";
import { ParseUser, Strings } from "../shared";
import { updateEmail } from "../triggers";

export interface VerifyEmailParams {
  code: string;
  email: string;
}

/** Function to verify email */
const verifyEmail = async ({ code, email }: VerifyEmailParams) => {
  const user = await ParseUser.cloudQuery(Parse)
    .equalTo(ParseUser.COLUMNS.email, email)
    .first({ useMasterKey: true });
  if (!user) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, Strings.cloud.error.userNotFound);
  }
  if (user.verificationCode !== code) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, Strings.cloud.error.invalidVerificationCode);
  }
  user.verificationCode = undefined;
  await user.save({ useMasterKey: true });

  await updateEmail(user);
};

export default loggerWrapper("verifyEmail", verifyEmail);
