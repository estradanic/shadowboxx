import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Avatar, AvatarProps } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import cx from "classnames";
import { useUserContext } from "../../contexts";
import { ParseUser, ParseImage } from "../../types";

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.error.contrastText,
    cursor: "pointer",
  },
}));

/** Interface defining props for UserAvatar */
export interface UserAvatarProps extends AvatarProps {
  /** Email of the user to display */
  email: string;
  /** Function to get user. If provided, this component does not request data from the server */
  fetchUser?: () => ParseUser;
}

/** Component to display the profile picture of a user */
const UserAvatar = forwardRef(
  (
    { email, fetchUser, className: piClassName = "", ...rest }: UserAvatarProps,
    ref: ForwardedRef<any>
  ) => {
    const classes = useStyles();
    const { loggedInUser, profilePicture } = useUserContext();
    const [src, setSrc] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const setProfilePicture = useCallback(
      (user: ParseUser) => {
        if (user && user.profilePicture?.exists) {
          ParseImage.query()
            .equalTo(ParseImage.COLUMNS.id, user.profilePicture.id)
            .first()
            .then((profilePictureResponse) => {
              if (profilePictureResponse) {
                const newProfilePicture = new ParseImage(
                  profilePictureResponse
                );
                setSrc(newProfilePicture?.file.url() ?? "");
              }
            });
        }
      },
      [setSrc]
    );

    useEffect(() => {
      if (fetchUser) {
        const user = fetchUser();
        setFirstName(user?.firstName ?? user?.email ?? email);
        setLastName(user?.lastName ?? "");
        setProfilePicture(user);
      } else if (email === loggedInUser?.email) {
        setSrc(profilePicture?.file.url() ?? "");
        setFirstName(loggedInUser?.firstName ?? "");
        setLastName(loggedInUser?.lastName ?? "");
      } else {
        ParseUser.query()
          .equalTo(ParseUser.COLUMNS.email, email)
          .first()
          .then((response) => {
            if (response) {
              const fetchedUser = new ParseUser(response);
              setProfilePicture(fetchedUser);
              setFirstName(fetchedUser?.firstName ?? email);
              setLastName(fetchedUser?.lastName ?? "");
            } else {
              setFirstName(email);
              setLastName("");
            }
          });
      }
    }, [
      email,
      loggedInUser,
      fetchUser,
      profilePicture?.file,
      setProfilePicture,
    ]);

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
);

export default UserAvatar;
