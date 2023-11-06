import React, { useState, ChangeEvent } from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import { makeStyles, Theme } from "@material-ui/core/styles";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import { validatePassword } from "../../utils";
import { Strings } from "../../resources";
import TextField, { TextFieldProps } from "./TextField";

const useStyles = makeStyles((theme: Theme) => ({
  endAdornment: {
    color: theme.palette.primary.light,
    cursor: "pointer",
    marginRight: theme.spacing(2),
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
  /** Whether to validate input */
  validate?: boolean;
}

/**
 * Component for entering passwords and other "hidden" text
 */
const PasswordField = ({
  InputProps: piInputProps,
  validate,
  onChange: piOnChange,
  value: piValue,
  helperText: piHelperText,
  error: piError,
  ...rest
}: PasswordFieldProps) => {
  const classes = useStyles();
  const [passwordIsMasked, setPasswordIsMasked] = useState<boolean>(true);
  const [value, setValue] = useState(piValue);
  const [helperText, setHelperText] = useState(piHelperText);
  const [error, setError] = useState(piError);
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (
      validate &&
      !validatePassword(event.target.value) &&
      event.target.value?.length > 0
    ) {
      setError(true);
      setHelperText(Strings.message.passwordHelperText);
    } else {
      setError(piError);
      setHelperText(piHelperText);
    }
    setValue(event.target.value);
    piOnChange?.(event);
  };

  return (
    <TextField
      error={error}
      helperText={helperText}
      onChange={onChange}
      value={value}
      type={passwordIsMasked ? "password" : "text"}
      className={classes.input}
      inputProps={{ className: classes.input }}
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
