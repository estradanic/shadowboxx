/** Function to check the whitelist of users and return if a given user is allowed to log in */
const isUserWhitelisted = async (user: Parse.User): Promise<boolean> => {
  const whitelist = await new Parse.Query("Whitelist").find({
    useMasterKey: true,
  });
  return (
    whitelist.findIndex((entry) => {
      const pattern = new RegExp(entry.get("pattern"));
      return pattern.test(user.get("email"));
    }) !== -1
  );
};

/** Function to check the whitelist of uses and return whether the Session is allowed to save */
const isSessionAllowed = async (session: Parse.Session): Promise<boolean> => {
  const user = await session.get("user").fetch({ useMasterKey: true });
  return isUserWhitelisted(user);
};

export default isSessionAllowed;
