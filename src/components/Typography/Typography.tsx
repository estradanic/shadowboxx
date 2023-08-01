import React from "react";
import MuiTypography, {
  TypographyProps as MuiTypographyProps,
} from "@material-ui/core/Typography";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import { TypographyColor } from "../../types";

type UseStylesProps = {
  color: TypographyColor;
};

const getTypographyColor = (color: TypographyColor, theme: Theme) => {
  switch (color) {
    case "primary":
      return theme.palette.primary.main;
    case "secondary":
      return theme.palette.secondary.main;
    case "error":
      return theme.palette.error.main;
    case "warning":
      return theme.palette.warning.main;
    case "info":
      return theme.palette.info.main;
    case "success":
      return theme.palette.success.main;
    case "inherit":
      return "inherit";
    case "primaryContrast":
      return theme.palette.primary.contrastText;
    case "secondaryContrast":
      return theme.palette.secondary.contrastText;
    case "errorContrast":
      return theme.palette.error.contrastText;
    case "warningContrast":
      return theme.palette.warning.contrastText;
    case "infoContrast":
      return theme.palette.info.contrastText;
    case "successContrast":
      return theme.palette.success.contrastText;
    case "textPrimary":
      return theme.palette.text.primary;
    case "textSecondary":
      return theme.palette.text.secondary;
    case "disabled":
      return theme.palette.text.disabled;
  }
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: ({ color }: UseStylesProps) => getTypographyColor(color, theme),
  },
}));

export interface TypographyProps extends Omit<MuiTypographyProps, "color"> {
  color?: TypographyColor;
}

const Typography = ({
  color = "textPrimary",
  children,
  ...rest
}: TypographyProps) => {
  const classes = useStyles({ color });
  return (
    <MuiTypography
      {...rest}
      className={classNames(classes.root, rest.className)}
    >
      {children}
    </MuiTypography>
  );
};

export default Typography;
