import React from "react";
import UserLabel from "./UserLabel";
import UserAvatar from "./UserAvatar";
import Chip, { ChipProps } from "@material-ui/core/Chip";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { UseUserInfoParams } from "../../hooks";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: "4px",
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
  /** Params to be passed into useUserInfo */
  UseUserInfoParams: UseUserInfoParams;
}

/** Component to display the name and profile picture of a user */
const UserChip = ({ UseUserInfoParams, ...rest }: UserChipProps) => {
  const classes = useStyles();
  return (
    <Chip
      {...rest}
      classes={classes}
      icon={<UserAvatar UseUserInfoParams={UseUserInfoParams} />}
      label={<UserLabel UseUserInfoParams={UseUserInfoParams} />}
    />
  );
};

export default UserChip;
