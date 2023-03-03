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
    throw new Parse.Error(404, Strings.cloud.error.userNotFound);
  }
  if (user.get(ParseUser.COLUMNS.verificationCode) !== code) {
    throw new Parse.Error(400, Strings.cloud.error.invalidVerificationCode);
  }
  user.set(ParseUser.COLUMNS.verificationCode, undefined);
  await user.save(null, { useMasterKey: true });

  await updateEmail(user);
};

export default loggerWrapper("verifyEmail", verifyEmail);
