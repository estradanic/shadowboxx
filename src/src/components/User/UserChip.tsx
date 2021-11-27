import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import UserLabel from "./UserLabel";
import UserAvatar from "./UserAvatar";
import { Chip, ChipProps } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Parse from "parse";

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
  /** User to display */
  user?: Parse.User;
  /** Email of the user to display */
  email?: string;
  /** Function to run when the user is resolved */
  onResolve?: (user: Parse.User) => void;
}

/** Component to display the name and profile picture of a user */
const UserChip = memo(
  ({ user: piUser, email, onResolve, ...rest }: UserChipProps) => {
    const classes = useStyles();
    const mountedRef = useRef(true);
    const [user, setUser] = useState<Parse.User>();
    const currentUser = Parse.User.current();

    const resolveUser = useCallback(
      (resolvedUser: Parse.User) => {
        setUser(resolvedUser);
        onResolve?.(resolvedUser);
      },
      [setUser, onResolve]
    );

    useEffect(() => {
      if (mountedRef.current) {
        if (
          currentUser &&
          ((!piUser && !email) ||
            (piUser && piUser?.getEmail() === currentUser?.getEmail()) ||
            (email && email === currentUser?.getEmail()))
        ) {
          resolveUser(currentUser);
        } else if (
          !piUser ||
          !piUser.get("firstName") ||
          !piUser.get("lastName") ||
          !piUser.get("profilePicture")?.url()
        ) {
          new Parse.Query<Parse.User>("User")
            .equalTo("email", piUser?.getEmail() ?? email)
            .first()
            .then((response) => {
              if (!response) {
                resolveUser(piUser ?? new Parse.User());
              } else {
                resolveUser(response);
              }
            })
            .catch((error) => {
              resolveUser(piUser ?? new Parse.User());
            });
        } else {
          resolveUser(piUser);
        }
      }
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, [email, currentUser, piUser, resolveUser]);

    return (
      <Chip
        {...rest}
        classes={classes}
        icon={<UserAvatar noFetch user={user} />}
        label={<UserLabel noFetch user={user} />}
      />
    );
  }
);

export default UserChip;
