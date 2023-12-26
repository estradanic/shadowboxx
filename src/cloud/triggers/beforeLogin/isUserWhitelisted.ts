import loggerWrapper from "../../loggerWrapper";
import { ParseUser } from "../../shared";

/** Function to check the whitelist of users and return if a given user is allowed to log in */
const isUserWhitelisted = async (user: ParseUser): Promise<boolean> => {
  const whitelist = await new Parse.Query("Whitelist").find({
    useMasterKey: true,
  });
  return (
    whitelist.findIndex((entry) => {
      const pattern = new RegExp(entry.get("pattern"));
      return pattern.test(user.username);
    }) !== -1
  );
};

export default loggerWrapper("isUserWhitelisted", isUserWhitelisted);
