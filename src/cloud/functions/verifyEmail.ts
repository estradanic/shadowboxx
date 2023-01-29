export interface VerifyEmailParams {
  code: string;
  email: string;
}

/** Function to verify email */
const verifyEmail = async ({ code, email }: VerifyEmailParams) => {
  const user = await new Parse.Query(Parse.User)
    .equalTo("email", email)
    .first({ useMasterKey: true });
  if (!user) {
    throw new Parse.Error(404, "User not found");
  }
  if (user.get("verificationCode") !== code) {
    throw new Parse.Error(400, "Invalid verification code");
  }
  user.set("verificationCode", "");
  await user.save(null, { useMasterKey: true });
};

export default verifyEmail;
