import React, { memo, useEffect, useState } from "react";
import { Typography, TypographyProps } from "@material-ui/core";
import { ParseUser, User } from "../../types/User";
import { useUserContext } from "../../app/UserContext";

/** Interface defining props for UserLabel */
export interface UserLabelProps extends TypographyProps {
  /** User to display */
  user?: ParseUser;
  /** Email of the user to display */
  email?: string;
  /** Do not try to fetch user information from the server */
  noFetch?: boolean;
}

/** Component to display the name of a user */
const UserLabel = memo(
  ({ user, email, noFetch = false, ...rest }: UserLabelProps) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const { loggedInUser } = useUserContext();

    useEffect(() => {
      if (
        loggedInUser &&
        ((!user && !email) ||
          (user && user?.email === loggedInUser?.email) ||
          (email && email === loggedInUser?.email))
      ) {
        setFirstName(loggedInUser.firstName);
        setLastName(loggedInUser.lastName);
      } else if (
        (!user || !user.firstName || !user.lastName) &&
        !noFetch &&
        email
      ) {
        new Parse.Query<Parse.User<User>>("User")
          .equalTo("email", user?.email ?? email)
          .first()
          .then((response) => {
            if (response) {
              const fetchedUser = new ParseUser(response);
              setFirstName(
                fetchedUser?.firstName ??
                  user?.firstName ??
                  user?.email ??
                  email ??
                  ""
              );
              setLastName(fetchedUser?.lastName ?? "");
            }
          });
      } else {
        setFirstName(user?.firstName ?? user?.email ?? email ?? "");
        setLastName(user?.lastName ?? "");
      }
    }, [user, email, loggedInUser, noFetch]);

    return (
      <Typography variant="overline" {...rest}>
        {`${firstName} ${lastName}`}
      </Typography>
    );
  }
);

export default UserLabel;
