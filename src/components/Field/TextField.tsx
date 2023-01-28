import React, { ForwardedRef, forwardRef } from "react";
import MuiTextField, {
  FilledTextFieldProps,
} from "@material-ui/core/TextField";
import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "&& > div": {
      backgroundColor: theme.palette.background.paper,
      borderRadius: "4px",
    },
    "&& > label": {
      color: theme.palette.text.primary,
    },
    "&& > label.Mui-focused": {
      color: theme.palette.primary.dark,
    },
    borderRadius: "4px",
  },
}));

/** Interface defining props for TextField */
export interface TextFieldProps
  extends Omit<FilledTextFieldProps, "variant" | "classes"> {}

/** Component to input text */
const TextField = forwardRef(
  (props: TextFieldProps, ref: ForwardedRef<any>) => {
    const classes = useStyles();

    return (
      <MuiTextField variant="filled" classes={classes} {...props} ref={ref} />
    );
  }
);

export default TextField;
