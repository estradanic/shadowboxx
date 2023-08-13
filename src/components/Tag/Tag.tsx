import React from "react";
import Chip, { ChipProps } from "@material-ui/core/Chip";
import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: "4px",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    height: theme.spacing(3),
    margin: theme.spacing(0.5),
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

/** Interface defining props for Tag */
export interface TagProps extends ChipProps {}

/** Component to display a tag */
const Tag = ({ className, classes: piClasses = {}, ...rest }: TagProps) => {
  const classes = useStyles();
  return (
    <Chip
      {...rest}
      classes={{
        ...classes,
        ...piClasses,
      }}
    />
  );
};

export default Tag;
