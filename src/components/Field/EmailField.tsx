import React, { useState } from "react";
import { validateEmail } from "../../utils";
import { Strings } from "../../resources";
import TextField, { TextFieldProps } from "./TextField";

/**
 * Interface defining props for EmailField
 */
export interface EmailFieldProps extends Omit<TextFieldProps, "type"> {
  /** Whether to validate input or not */
  validate?: boolean;
}

/**
 * Component for entering email addresses
 */
const EmailField = ({
  validate,
  onChange: piOnChange,
  value: piValue,
  helperText: piHelperText,
  error: piError,
  ...rest
}: EmailFieldProps) => {
  const [value, setValue] = useState(piValue);
  const [helperText, setHelperText] = useState(piHelperText);
  const [error, setError] = useState(piError);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (
      validate &&
      !validateEmail(event.target.value) &&
      event.target.value?.length > 0
    ) {
      setError(true);
      setHelperText(Strings.invalidEmail(event.target.value));
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
      type="email"
      {...rest}
    />
  );
};

export default EmailField;
