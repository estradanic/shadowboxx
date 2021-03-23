import React, {memo} from "react";
import {Avatar, AvatarProps} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {UserInfo, useUserContext} from "../../app/UserContext";
import {sendHTTPRequest} from "../../utils/requestUtils";
import cx from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.error.contrastText,
    cursor: "pointer",
  },
}));

export interface UserAvatarProps extends AvatarProps {
  user?: UserInfo;
}

const UserAvatar = memo(
  ({user, className: piClassName = "", ...rest}: UserAvatarProps) => {
    const classes = useStyles();
    const globalUser = useUserContext();
    let src = "";

    if (!user) {
      user = globalUser;
      src = globalUser.profilePicture?.src ?? "";
    } else if (user.email === globalUser.email) {
      src = globalUser.profilePicture?.src ?? "";
    } else {
      sendHTTPRequest<string, string>({
        method: "POST",
        url: "/api/func_ProfilePicture",
        data: user.email,
        callback: (result) => {
          src = result;
        },
      });
    }

    return (
      <Avatar
        alt={`${user.firstName} ${user.lastName}`}
        className={cx(classes.avatar, piClassName)}
        src={src}
        {...rest}
      />
    );
  },
);

export default UserAvatar;
