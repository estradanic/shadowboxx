/** Function to check if user email is verified */
const isEmailVerified = async (user: Parse.User) => {
  const persistedUser = await new Parse.Query(Parse.User).get(user.id, {
    useMasterKey: true,
  });
  return !persistedUser.get("verificationCode");
};

export default isEmailVerified;
