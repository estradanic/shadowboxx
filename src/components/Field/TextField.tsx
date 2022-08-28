import React from "react";
import MuiTextField, {
  FilledTextFieldProps,
} from "@material-ui/core/TextField";
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

  return <MuiTextField variant="filled" classes={classes} {...props} />;
};

export default TextField;
