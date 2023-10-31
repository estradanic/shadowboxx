import React from "react";
import MuiChip, { ChipProps as MuiChipProps } from "@material-ui/core/Chip";
import { makeStyles, Theme } from "@material-ui/core/styles";

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
    color: theme.palette.primary.contrastText,
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

export interface ChipProps extends MuiChipProps {}

const Chip = ({ classes: piClasses, ...rest }: ChipProps) => {
  const classes = useStyles();
  return <MuiChip {...rest} classes={{ ...classes, ...piClasses }} />;
};

export default Chip;
