import React from "react";
import Typography, { TypographyProps } from "@material-ui/core/Typography";
import { useUserInfo, UseUserInfoParams } from "../../hooks";

/** Interface defining props for UserLabel */
export interface UserLabelProps extends TypographyProps {
  /** Params to be passed into useUserInfo */
  UseUserInfoParams: UseUserInfoParams;
}

/** Component to display the name of a user */
const UserLabel = ({ UseUserInfoParams, ...rest }: UserLabelProps) => {
  const user = useUserInfo(UseUserInfoParams);

  return (
    <Typography variant="overline" {...rest}>
      {user?.name}
    </Typography>
  );
};

export default UserLabel;
