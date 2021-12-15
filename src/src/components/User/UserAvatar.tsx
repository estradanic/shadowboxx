import React, {
  ForwardedRef,
  forwardRef,
  memo,
  useEffect,
  useState,
} from "react";
import { Avatar, AvatarProps } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import cx from "classnames";
import Parse from "parse";
import { ParseUser } from "../../types/User";
import { ParseImage } from "../../types/Image";
import { useUserContext } from "../../app/UserContext";

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
      const { loggedInUser, profilePicture } = useUserContext();
      const [src, setSrc] = useState("");
      const [firstName, setFirstName] = useState("");
      const [lastName, setLastName] = useState("");

      useEffect(() => {
        if (
          (!user && !email) ||
          (user && user?.getEmail() === loggedInUser?.getEmail()) ||
          (email && email === loggedInUser?.getEmail())
        ) {
          setSrc(profilePicture?.file.url() ?? "");
          setFirstName(loggedInUser?.firstName ?? "");
          setLastName(loggedInUser?.lastName ?? "");
        } else if (
          (!user ||
            !user?.firstName ||
            !user?.lastName ||
            !profilePicture?.file?.url()) &&
          !noFetch
        ) {
          new Parse.Query<ParseUser>("User")
            .equalTo("email", user?.getEmail() ?? email ?? "")
            .first()
            .then((response) => {
              new Parse.Query<ParseImage>("Image")
                .equalTo("objectId", response?.profilePicture?.objectId)
                .first()
                .then((profilePictureResponse) => {
                  setSrc(
                    profilePictureResponse?.file.url() ??
                      profilePicture?.file?.url() ??
                      ""
                  );
                });
              setFirstName(
                response?.firstName ??
                  user?.firstName ??
                  user?.getEmail() ??
                  email ??
                  ""
              );
              setLastName(response?.lastName ?? user?.lastName ?? "");
            });
        } else {
          setSrc(profilePicture?.file?.url() ?? "");
          setFirstName(user?.firstName ?? user?.getEmail() ?? email ?? "");
          setLastName(user?.lastName ?? "");
        }
      }, [user, email, loggedInUser, noFetch, profilePicture?.file]);

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
