import React, { useEffect, useMemo, useRef, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import TextField, { TextFieldProps } from "./TextField";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "30rem",
    justifyContent: "space-between",
    flexWrap: "nowrap",
  },
  field: {
    margin: "auto",
    "& input": {
      width: "3rem",
      textAlign: "center",
      height: "3rem",
      padding: 0,
      "-moz-appearance": "textfield",
      borderRadius: "4px",
      border: `1px solid ${theme.palette.primary.main}`,
    },
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
    },
  },
}));

const LENGTH = 6 as const;

export interface OtpProps
  extends Omit<TextFieldProps, "type" | "onChange" | "value"> {
  /** Callback fired when the value is changed */
  onChange: (value: string) => void | Promise<void>;
  /** The value of the input */
  value: string;
}

/** Component to input a One-time-password */
const OtpField = ({ onChange, value, ...rest }: OtpProps) => {
  const classes = useStyles();
  const [values, setValues] = useState<string[]>(
    Array.from({ ...value.split(""), length: LENGTH })
  );
  const refArray = useRef(new Array(LENGTH).fill({ current: null }));
  const inputId = useMemo(() => `otp-${9}`, []);

  useEffect(() => {
    onChange(values.join(""));
  }, [values, onChange]);

  return (
    <div className={classes.container}>
      {values.map((singleValue, i) => (
        <TextField
          ref={refArray.current[i]}
          {...rest}
          className={classes.field}
          key={`${inputId}-${i}`}
          id={`${inputId}-${i}`}
          type="number"
          autoFocus={i === 0 ? true : false}
          value={singleValue ?? ""}
          onChange={async (e) => {
            if (e.target.value.length > 1) return;
            setValues((prev) => {
              const newValue = [...prev];
              newValue[i] = e.target.value;
              return newValue;
            });
            if (i < LENGTH - 1 && e.target.value.length === 1) {
              (
                document.querySelector(`#${inputId}-${i + 1}`) as HTMLElement
              )?.focus();
            } else if (i > 0 && e.target.value.length === 0) {
              (
                document.querySelector(`#${inputId}-${i - 1}`) as HTMLElement
              )?.focus();
            }
          }}
          inputProps={{
            maxLength: 1,
            max: 9,
            min: 0,
            step: 1,
          }}
        />
      ))}
    </div>
  );
};

export default OtpField;
