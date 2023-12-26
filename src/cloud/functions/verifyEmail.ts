import loggerWrapper from "../loggerWrapper";
import { ParseUser, Strings } from "../shared";
import { updateEmail } from "../triggers";

export interface VerifyEmailParams {
  /** Verification code to verify email */
  code: string;
  /** Email to verify */
  email: string;
}

/** Function to verify email */
const verifyEmail = async ({ code, email }: VerifyEmailParams) => {
  console.log(`Verifying email ${email}`);
  let user = await ParseUser.cloudQuery(Parse)
    .equalTo(ParseUser.COLUMNS.email, email)
    .first({ useMasterKey: true });
  if (!user) {
    throw new Parse.Error(
      Parse.Error.OBJECT_NOT_FOUND,
      Strings.cloud.error.userNotFound
    );
  }
  console.log(`Found user:`, user.attributes);
  if (user.verificationCode !== code) {
    throw new Parse.Error(
      Parse.Error.INVALID_QUERY,
      Strings.cloud.error.invalidVerificationCode
    );
  }
  user.verificationCode = undefined;
  console.log("Going to save user:", user.attributes);
  user = await user.cloudSave({
    useMasterKey: true,
    context: { noTrigger: true },
  });

  user.email = email;
  await updateEmail(user);
};

export default loggerWrapper("verifyEmail", verifyEmail);
