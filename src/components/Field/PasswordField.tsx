import React, {useState} from "react";
import {
  FilledTextFieldProps,
  TextField,
  InputAdornment,
} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Visibility, VisibilityOff} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) => ({
  endAdornment: {
    color: theme.palette.primary.light,
    cursor: "pointer",
  },
  input: {
    backgroundColor: `${theme.palette.background.paper} !important`,
    color: `${theme.palette.text.primary} !important`,
    "&:-webkit-autofill, &:-moz-autofill, &:-o-autofill, &:-khtml-autofill, &:-internal-autofill-selected": {
      backgroundColor: `${theme.palette.background.paper} !important`,
      color: `${theme.palette.text.primary} !important`,
      "&:focus": {
        backgroundColor: `${theme.palette.background.paper} !important`,
        color: `${theme.palette.text.primary} !important`,
      },
    },
  },
}));

/**
 * Interface defining props for PasswordField
 */
export interface PasswordFieldProps
  extends Omit<FilledTextFieldProps, "type" | "variant"> {}

/**
 * Component for entering passwords and other "hidden" text
 */
const PasswordField = ({
  InputProps: piInputProps,
  ...rest
}: PasswordFieldProps) => {
  const classes = useStyles();
  const [passwordIsMasked, setPasswordIsMasked] = useState<boolean>(true);

  return (
    <TextField
      type={passwordIsMasked ? "password" : "text"}
      variant="filled"
      className={classes.input}
      inputProps={{className: classes.input}}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {passwordIsMasked ? (
              <VisibilityOff
                className={classes.endAdornment}
                onClick={() => setPasswordIsMasked(false)}
              />
            ) : (
              <Visibility
                className={classes.endAdornment}
                onClick={() => setPasswordIsMasked(true)}
              />
            )}
          </InputAdornment>
        ),
        className: classes.input,
        ...piInputProps,
      }}
      {...rest}
    />
  );
};

export default PasswordField;
