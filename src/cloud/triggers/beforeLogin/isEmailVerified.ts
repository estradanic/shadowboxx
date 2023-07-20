import loggerWrapper from "../../loggerWrapper";
import { ParseUser } from "../../shared";

/** Function to check if user email is verified */
const isEmailVerified = async (user: ParseUser) => {
  const persistedUser = await ParseUser.cloudQuery(Parse).get(user.id, {
    useMasterKey: true,
  });
  return !persistedUser.verificationCode;
};

export default loggerWrapper("isEmailVerified", isEmailVerified);
