import loggerWrapper from "../../loggerWrapper";
import { NativeAttributes, ParseUser } from "../../shared";

/** Function to check the whitelist of users and return if a given user is allowed to log in */
const isUserWhitelisted = async (
  user: Parse.User<NativeAttributes<"_User">>
): Promise<boolean> => {
  const whitelist = await new Parse.Query("Whitelist").find({
    useMasterKey: true,
  });
  return (
    whitelist.findIndex((entry) => {
      const pattern = new RegExp(entry.get("pattern"));
      return pattern.test(user.get(ParseUser.COLUMNS.email));
    }) !== -1
  );
};

export default loggerWrapper("isUserWhitelisted", isUserWhitelisted);
