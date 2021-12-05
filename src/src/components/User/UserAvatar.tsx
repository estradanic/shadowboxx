import React, {
  ForwardedRef,
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Avatar, AvatarProps } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import cx from "classnames";
import Parse from "parse";
import { ParseUser } from "../../types/User";
import { useParseQuery } from "@parse/react";
import { ParseImage } from "../../types/Image";
import { useParseQueryOptions } from "../../constants/useParseQueryOptions";

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.error.contrastText,
    cursor: "pointer",
  },
}));

/** Interface defining props for UserAvatar */
export interface UserAvatarProps extends AvatarProps {
  /** User to display */
  user?: ParseUser;
  /** Email of the user to display */
  email?: string;
  /** Do not try to fetch user info from the server */
  noFetch?: boolean;
}

/** Component to display the profile picture of a user */
const UserAvatar = memo(
  forwardRef(
    (
      {
        user,
        email,
        noFetch = false,
        className: piClassName = "",
        ...rest
      }: UserAvatarProps,
      ref: ForwardedRef<any>
    ) => {
      const classes = useStyles();
      const globalUser = ParseUser.current();
      const [src, setSrc] = useState("");
      const [firstName, setFirstName] = useState("");
      const [lastName, setLastName] = useState("");

      const { results: profilePictureResult } = useParseQuery(
        new Parse.Query<ParseImage>("Image").equalTo(
          "objectId",
          user!.get("profilePicture")?.objectId
        ),
        useParseQueryOptions
      );
      const profilePicture = useMemo(() => profilePictureResult?.[0], [
        profilePictureResult,
      ]);

      useEffect(() => {
        if (
          (!user && !email) ||
          (user && user?.getEmail() === globalUser?.getEmail()) ||
          (email && email === globalUser?.getEmail())
        ) {
          setSrc(globalUser?.get("profilePicture")?.url() ?? "");
          setFirstName(globalUser?.get("firstName"));
          setLastName(globalUser?.get("lastName"));
        } else if (
          (!user ||
            !user?.get("firstName") ||
            !user?.get("lastName") ||
            !profilePicture?.get("file")?.url()) &&
          !noFetch
        ) {
          new Parse.Query("User")
            .equalTo("email", user?.getEmail() ?? email)
            .first()
            .then((response) => {
              setSrc(
                response?.get("profilePicture")?.url() ??
                  profilePicture?.get("file")?.url() ??
                  ""
              );
              setFirstName(
                response?.get("firstName") ??
                  user?.get("firstName") ??
                  user?.getEmail() ??
                  email
              );
              setLastName(
                response?.get("lastName") ?? user?.get("lastName") ?? ""
              );
            });
        } else {
          setSrc(profilePicture?.get("file")?.url() ?? "");
          setFirstName(
            user?.get("firstName") ?? user?.getEmail() ?? email ?? ""
          );
          setLastName(user?.get("lastName") ?? "");
        }
      }, [user, email, globalUser, noFetch]);

      return (
        <Avatar
          ref={ref}
          alt={`${firstName} ${lastName}`}
          className={cx(classes.avatar, piClassName)}
          src={src}
          {...rest}
        />
      );
    }
  )
);

export default UserAvatar;
