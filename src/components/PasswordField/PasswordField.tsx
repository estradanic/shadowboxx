import React, {useState} from "react";
import {
  FilledTextFieldProps,
  TextField,
  InputAdornment,
} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import cx from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  textField: {},
  endAdornment: {
    color: theme.palette.primary.light,
    cursor: "pointer",
  },
}));

export interface PasswordFieldProps
  extends Omit<FilledTextFieldProps, "type" | "variant"> {}

const PasswordField = ({
  className: piClassName,
  InputProps: piInputProps,
  ...rest
}: PasswordFieldProps) => {
  const classes = useStyles();
  const className = cx(classes.textField, piClassName);
  const [passwordIsMasked, setPasswordIsMasked] = useState<boolean>(true);

  return (
    <TextField
      type={passwordIsMasked ? "password" : "text"}
      variant="filled"
      className={className}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {passwordIsMasked ? (
              <Visibility
                className={classes.endAdornment}
                onClick={() => setPasswordIsMasked(false)}
              />
            ) : (
              <VisibilityOff
                className={classes.endAdornment}
                onClick={() => setPasswordIsMasked(true)}
              />
            )}
          </InputAdornment>
        ),
        ...piInputProps,
      }}
      {...rest}
    />
  );
};

export default PasswordField;
