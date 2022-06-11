import React from "react";
import {
  TextField as MatTextField,
  FilledTextFieldProps,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "&& > div": {
      backgroundColor: theme.palette.background.paper,
    },
    "&& > label": {
      color: theme.palette.text.primary,
    },
    "&& > label.Mui-focused": {
      color: theme.palette.primary.dark,
    },
  },
}));

/** Interface defining props for TextField */
export interface TextFieldProps
  extends Omit<FilledTextFieldProps, "variant" | "classes"> {}

/** Component to input text */
const TextField = (props: TextFieldProps) => {
  const classes = useStyles();

  return <MatTextField variant="filled" classes={classes} {...props} />;
};

export default TextField;
