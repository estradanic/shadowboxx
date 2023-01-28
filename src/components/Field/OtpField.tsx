import React, { MutableRefObject, useMemo, useRef, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import TextField, { TextFieldProps } from "./TextField";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "nowrap",
  },
  field: {
    margin: theme.spacing(2),
    "& input": {
      width: "3rem",
      textAlign: "center",
      height: "3rem",
      padding: 0,
      "-moz-appearance": "textfield",
    },
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
    },
  },
}));

export interface OtpProps extends Omit<TextFieldProps, "type"> {
  length?: number;
  type?: "text" | "number";
  onCompleted: (otp: string) => void | Promise<void>;
}

/** Component to input a One-time-password */
const OtpField = ({
  length = 6,
  type = "number",
  onCompleted,
  ...rest
}: OtpProps) => {
  const classes = useStyles();
  const [value, setValue] = useState<string[]>(new Array(length).fill(""));
  const refArray = useRef(new Array(length).fill({ current: null }));
  const inputId = useMemo(() => `otp-${9}`, []);

  return (
    <div className={classes.container}>
      {value.map((val, i) => (
        <TextField
          ref={refArray.current[i]}
          {...rest}
          className={classes.field}
          key={`${inputId}-${i}`}
          id={`${inputId}-${i}`}
          type={type}
          autoFocus={i === 0 ? true : false}
          value={val}
          onChange={async (e) => {
            if (e.target.value.length > 1) return;
            setValue((prev) => {
              const newValue = [...prev];
              newValue[i] = e.target.value;
              return newValue;
            });
            if (i < length - 1 && e.target.value.length === 1) {
              (
                document.querySelector(`#${inputId}-${i + 1}`) as HTMLElement
              )?.focus();
            } else if (i > 0 && e.target.value.length === 0) {
              (
                document.querySelector(`#${inputId}-${i - 1}`) as HTMLElement
              )?.focus();
            }
            if (
              e.target.value.length === 1 &&
              value.join("").length + 1 === length
            ) {
              const newValue = [...value];
              newValue[i] = e.target.value;
              // Wait for the ui to update
              setTimeout(async () => {
                await onCompleted(newValue.join(""));
              }, 10);
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
