import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import UserLabel from "./UserLabel";
import UserAvatar from "./UserAvatar";
import { Chip, ChipProps } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Parse from "parse";
import { ParseUser, User } from "../../types/User";
import { useParseQuery } from "@parse/react";
import { useParseQueryOptions } from "../../constants/useParseQueryOptions";
import { Image, ParseImage } from "../../types/Image";
import { useUserContext } from "../../app/UserContext";

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
  user?: ParseUser;
  /** Email of the user to display */
  email?: string;
  /** Function to run when the user is resolved */
  onResolve?: (user: ParseUser) => void;
}

/** Component to display the name and profile picture of a user */
const UserChip = memo(
  ({ user: piUser, email, onResolve, ...rest }: UserChipProps) => {
    const classes = useStyles();
    const mountedRef = useRef(true);
    const [user, setUser] = useState<ParseUser>();
    const { loggedInUser } = useUserContext();

    const { results: profilePictureResult } = useParseQuery(
      new Parse.Query<Parse.Object<Image>>("Image").equalTo(
        ParseImage.COLUMNS.id,
        user!.profilePicture?.id
      ),
      useParseQueryOptions
    );
    const profilePicture = useMemo(
      () =>
        profilePictureResult?.[0]
          ? new ParseImage(profilePictureResult[0])
          : undefined,
      [profilePictureResult]
    );

    const resolveUser = useCallback(
      (resolvedUser: ParseUser) => {
        setUser(resolvedUser);
        onResolve?.(resolvedUser);
      },
      [setUser, onResolve]
    );

    useEffect(() => {
      if (mountedRef.current) {
        if (
          loggedInUser &&
          ((!piUser && !email) ||
            (piUser && piUser?.email === loggedInUser.email) ||
            (email && email === loggedInUser.email))
        ) {
          resolveUser(loggedInUser);
        } else if (
          (!piUser ||
            !piUser.firstName ||
            !piUser.lastName ||
            !profilePicture?.file?.url()) &&
          email
        ) {
          new Parse.Query<Parse.User<User>>("User")
            .equalTo("email", piUser?.email ?? email)
            .first()
            .then((response) => {
              if (!response) {
                resolveUser(
                  piUser ??
                    ParseUser.fromAttributes({
                      username: email,
                      password: "",
                      firstName: email,
                    })
                );
              } else {
                resolveUser(new ParseUser(response));
              }
            })
            .catch(() => {
              resolveUser(
                piUser ??
                  ParseUser.fromAttributes({
                    username: email,
                    password: "",
                    firstName: email,
                  })
              );
            });
        } else if (piUser) {
          resolveUser(piUser);
        }
      }
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, [email, loggedInUser, piUser, resolveUser, profilePicture?.file]);

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
