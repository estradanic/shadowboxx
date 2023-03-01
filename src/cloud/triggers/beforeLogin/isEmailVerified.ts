import { NativeAttributes, ParseUser } from "../../shared";

/** Function to check if user email is verified */
const isEmailVerified = async (user: Parse.User<NativeAttributes<"_User">>) => {
  const persistedUser = await ParseUser.query().get(user.id, {
    useMasterKey: true,
  });
  return !persistedUser.get(ParseUser.COLUMNS.verificationCode);
};

export default isEmailVerified;
