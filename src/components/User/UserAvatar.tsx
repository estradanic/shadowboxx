import React, { ForwardedRef, forwardRef } from "react";
import Avatar, { AvatarProps } from "@material-ui/core/Avatar";
import { makeStyles, Theme } from "@material-ui/core/styles";
import cx from "classnames";
import { ParseUser, ParseImage } from "../../types";
import { Strings } from "../../resources";
import { useQuery } from "@tanstack/react-query";
import { useRequests } from "../../hooks";

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
    const {
      getUserByEmailFunction,
      getUserByEmailQueryKey,
      getUserByEmailOptions,
      getImageByIdFunction,
      getImageByIdQueryKey,
      getImageByIdOptions,
    } = useRequests();
    const { data: user } = useQuery<ParseUser, Error>(
      getUserByEmailQueryKey(email),
      () => (fetchUser ? fetchUser() : getUserByEmailFunction(email)),
      getUserByEmailOptions()
    );
    const { data: profilePicture } = useQuery<ParseImage, Error>(
      getImageByIdQueryKey(user?.profilePicture?.id),
      () => getImageByIdFunction(user?.profilePicture?.id),
      getImageByIdOptions()
    );

    return (
      <Avatar
        ref={ref}
        alt={user?.name ?? Strings.profilePicture()}
        className={cx(classes.avatar, piClassName)}
        src={profilePicture?.thumbnail?.url()}
        {...rest}
      />
    );
  }
);

export default UserAvatar;
