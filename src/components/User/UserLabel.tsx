import React, { memo } from "react";
import Typography, { TypographyProps } from "@material-ui/core/Typography";
import { ParseUser } from "../../types";
import { useRequests } from "../../hooks";
import { useQuery } from "@tanstack/react-query";

/** Interface defining props for UserLabel */
export interface UserLabelProps extends TypographyProps {
  /** Email of the user to display */
  email: string;
  /** Function to get user. If provided, this component does not request data from the server */
  fetchUser?: () => ParseUser;
}

/** Component to display the name of a user */
const UserLabel = memo(({ email, fetchUser, ...rest }: UserLabelProps) => {
  const {
    getUserByEmailFunction,
    getUserByEmailQueryKey,
    getUserByEmailOptions,
  } = useRequests();
  const { data: user } = useQuery<ParseUser, Error>(
    getUserByEmailQueryKey(email),
    () => (fetchUser ? fetchUser() : getUserByEmailFunction(email)),
    getUserByEmailOptions()
  );

  return (
    <Typography variant="overline" {...rest}>
      {user?.name}
    </Typography>
  );
});

export default UserLabel;
