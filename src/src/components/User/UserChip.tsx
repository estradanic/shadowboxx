import React, { memo, useEffect, useRef, useState } from "react";
import UserLabel from "./UserLabel";
import UserAvatar from "./UserAvatar";
import { Chip, ChipProps } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { ParseUser } from "../../types";
import { useUserContext } from "../../contexts";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    height: theme.spacing(3),
  },
  icon: {
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
  },
  deleteIcon: {
    color: theme.palette.error.main,
    borderRadius: "100%",
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    "&:hover, &:active, &:focus": {
      color: theme.palette.error.dark,
    },
  },
}));

/** Interface defining props for UserChip */
export interface UserChipProps
  extends Omit<ChipProps, "label" | "icon" | "component" | "classes"> {
  /** Email of the user to display */
  email: string;
  /** Function to get user. If provided, this component does not request data from the server */
  fetchUser?: () => ParseUser;
}

/** Component to display the name and profile picture of a user */
const UserChip = memo(({ email, fetchUser, ...rest }: UserChipProps) => {
  const classes = useStyles();
  const mountedRef = useRef(true);
  const [user, setUser] = useState<ParseUser>();
  const { loggedInUser } = useUserContext();

  useEffect(() => {
    if (mountedRef.current) {
      if (fetchUser) {
        setUser(fetchUser());
      }
      if (loggedInUser && email === loggedInUser.email) {
        setUser(loggedInUser);
      } else {
        ParseUser.query()
          .equalTo(ParseUser.COLUMNS.email, email)
          .first()
          .then(async (response) => {
            if (!response) {
              setUser(
                ParseUser.fromAttributes({
                  username: email,
                  password: "",
                  firstName: email,
                })
              );
            } else {
              await response.pin();
              setUser(new ParseUser(response));
            }
          })
          .catch(() => {
            setUser(
              ParseUser.fromAttributes({
                username: email,
                password: "",
                firstName: email,
              })
            );
          });
      }
    }
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [email, loggedInUser, setUser, fetchUser]);

  return (
    <Chip
      {...rest}
      classes={classes}
      icon={<UserAvatar fetchUser={() => user!} email={user?.email!} />}
      label={<UserLabel fetchUser={() => user!} email={user?.email!} />}
    />
  );
});

export default UserChip;
