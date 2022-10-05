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

export default isUserWhitelisted;
