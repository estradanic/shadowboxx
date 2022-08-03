import React, { memo, useEffect, useState } from "react";
import { Typography, TypographyProps } from "@material-ui/core";
import { ParseUser } from "../../types";
import { useUserContext } from "../../contexts";

/** Interface defining props for UserLabel */
export interface UserLabelProps extends TypographyProps {
  /** Email of the user to display */
  email: string;
  /** Function to get user. If provided, this component does not request data from the server */
  fetchUser?: () => ParseUser;
}

/** Component to display the name of a user */
const UserLabel = memo(({ email, fetchUser, ...rest }: UserLabelProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { loggedInUser } = useUserContext();

  useEffect(() => {
    if (fetchUser) {
      const user = fetchUser();
      setFirstName(user?.firstName ?? user?.email ?? email);
      setLastName(user?.lastName ?? "");
    } else if (loggedInUser && email === loggedInUser?.email) {
      setFirstName(loggedInUser.firstName);
      setLastName(loggedInUser.lastName);
    } else {
      ParseUser.query()
        .equalTo(ParseUser.COLUMNS.email, email)
        .first()
        .then(async (response) => {
          if (response) {
            await response.pin();
            const fetchedUser = new ParseUser(response);
            setFirstName(fetchedUser?.firstName ?? fetchedUser.email);
            setLastName(fetchedUser?.lastName ?? "");
          } else {
            setFirstName(email);
            setLastName("");
          }
        })
        .catch(() => {
          setFirstName(email);
          setLastName("");
        });
    }
  }, [email, loggedInUser, fetchUser]);

  return (
    <Typography variant="overline" {...rest}>
      {`${firstName} ${lastName}`}
    </Typography>
  );
});

export default UserLabel;
