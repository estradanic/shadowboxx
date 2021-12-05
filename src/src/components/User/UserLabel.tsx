import React, { memo, useEffect, useState } from "react";
import { Typography, TypographyProps } from "@material-ui/core";
import { ParseUser } from "../../types/User";

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
    const currentUser = ParseUser.current();

    useEffect(() => {
      if (
        currentUser &&
        ((!user && !email) ||
          (user && user?.getEmail() === currentUser?.getEmail()) ||
          (email && email === currentUser?.getEmail()))
      ) {
        setFirstName(currentUser.get("firstName"));
        setLastName(currentUser.get("lastName"));
      } else if (
        (!user || !user.get("firstName") || !user.get("lastName")) &&
        !noFetch &&
        email
      ) {
        new Parse.Query<ParseUser>("User")
          .equalTo("email", user?.getEmail() ?? email)
          .first()
          .then((response) => {
            setFirstName(
              response?.get("firstName") ??
                user?.get("firstName") ??
                user?.getEmail() ??
                email ??
                ""
            );
            setLastName(response?.get("lastName") ?? "");
          });
      } else {
        setFirstName(user?.get("firstName") ?? user?.getEmail() ?? email ?? "");
        setLastName(user?.get("lastName") ?? "");
      }
    }, [user, email, currentUser, noFetch]);

    return (
      <Typography variant="overline" {...rest}>
        {`${firstName} ${lastName}`}
      </Typography>
    );
  }
);

export default UserLabel;
