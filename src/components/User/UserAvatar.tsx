import React from "react";
import {Avatar} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {UserInfo} from "../../app/UserContext";

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {

  },
}));

export interface UserAvatarProps {
  user: UserInfo;
}

const UserAvatar = ({user}: UserAvatarProps) => {
  const classes = useStyles();

  return (
    <Avatar
      alt={`${user.firstName} ${user.lastName}`}
      className={classes.avatar}
      src={`/api/func_UserImage?email=${user.email}`} />
  );
};

export default UserAvatar;
