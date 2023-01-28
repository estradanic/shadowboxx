import React, { memo, useEffect, useRef, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { useSearchParams } from "react-router-dom";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  PageContainer,
  FancyTitleTypography,
  OtpField,
  Button,
} from "../../components";
import { Strings } from "../../resources";
import { useView } from "../View";

const useStyles = makeStyles((theme: Theme) => ({
  message: {
    wordBreak: "break-word",
    textAlign: "center",
  },
  buttonContainer: {
    maxWidth: "28rem",
    width: "100%",
  },
}));

const VerifyEmail = memo(() => {
  useView("VerifyEmail");

  const classes = useStyles();

  const [search] = useSearchParams();
  const email = search.get("email");
  const [otp, setOtp] = useState("");

  const buttonRef = useRef<HTMLButtonElement>(null);

  const verify = () => {};

  return (
    <PageContainer>
      {!!email && (
        <>
          <FancyTitleTypography>
            {Strings.verifyEmailTitle()}
          </FancyTitleTypography>
          <br />
          <br />
          <Typography className={classes.message}>
            {Strings.verifyEmail(email)}
          </Typography>
          <br />
          <br />
          <OtpField
            value={otp}
            onChange={(value) => setOtp(value)}
            onEnterKey={() => {
              buttonRef.current?.click();
            }}
          />
          <br />
          <br />
          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              disabledVariant="outlined"
              color="success"
              disabled={otp.length !== 6}
              size="large"
              fullWidth
              onClick={verify}
              ref={buttonRef}
            >
              {Strings.verify()}
            </Button>
          </div>
        </>
      )}
    </PageContainer>
  );
});

export default VerifyEmail;
