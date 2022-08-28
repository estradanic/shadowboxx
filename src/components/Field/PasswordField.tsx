import React, { useState } from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import { makeStyles, Theme } from "@material-ui/core/styles";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import TextField, { TextFieldProps } from "./TextField";

const useStyles = makeStyles((theme: Theme) => ({
  endAdornment: {
    color: theme.palette.primary.light,
    cursor: "pointer",
  },
  input: {
    backgroundColor: `${theme.palette.background.paper} !important`,
    color: `${theme.palette.text.primary} !important`,
    "&:-webkit-autofill, &:-moz-autofill, &:-o-autofill, &:-khtml-autofill, &:-internal-autofill-selected":
      {
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
export interface PasswordFieldProps extends Omit<TextFieldProps, "type"> {
  onEnterKey: () => void | Promise<void>;
}

/**
 * Component for entering passwords and other "hidden" text
 */
const PasswordField = ({
  InputProps: piInputProps,
  onEnterKey,
  ...rest
}: PasswordFieldProps) => {
  const classes = useStyles();
  const [passwordIsMasked, setPasswordIsMasked] = useState<boolean>(true);

  return (
    <TextField
      type={passwordIsMasked ? "password" : "text"}
      className={classes.input}
      inputProps={{ className: classes.input }}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          onEnterKey();
        }
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {passwordIsMasked ? (
              <VisibilityOffIcon
                className={classes.endAdornment}
                onClick={() => setPasswordIsMasked(false)}
              />
            ) : (
              <VisibilityIcon
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
