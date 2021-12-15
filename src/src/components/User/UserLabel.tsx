import React, { memo, useEffect, useState } from "react";
import { Typography, TypographyProps } from "@material-ui/core";
import { ParseUser } from "../../types/User";
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
          (user && user?.getEmail() === loggedInUser?.getEmail()) ||
          (email && email === loggedInUser?.getEmail()))
      ) {
        setFirstName(loggedInUser.firstName);
        setLastName(loggedInUser.lastName);
      } else if (
        (!user || !user.firstName || !user.lastName) &&
        !noFetch &&
        email
      ) {
        new Parse.Query<ParseUser>("User")
          .equalTo("email", user?.getEmail() ?? email)
          .first()
          .then((response) => {
            setFirstName(
              response?.firstName ??
                user?.firstName ??
                user?.getEmail() ??
                email ??
                ""
            );
            setLastName(response?.lastName ?? "");
          });
      } else {
        setFirstName(user?.firstName ?? user?.getEmail() ?? email ?? "");
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
