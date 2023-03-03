import React, { memo, useLayoutEffect, useRef, useState } from "react";
import Parse from "parse";
import Typography from "@material-ui/core/Typography";
import { useSearchParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  PageContainer,
  FancyTitleTypography,
  OtpField,
  Button,
  useSnackbar,
  Void,
} from "../../components";
import { Strings } from "../../resources";
import routes from "../../app/routes";
import useNavigate from "../../hooks/useNavigate";
import useUserInfo from "../../hooks/useUserInfo";
import { useUserContext } from "../../contexts/UserContext";

const useStyles = makeStyles(() => ({
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
  const classes = useStyles();

  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { isUserLoggedIn } = useUserContext();
  const [search] = useSearchParams();
  const email = search.get("email") ?? "";
  const [otp, setOtp] = useState("");
  const user = useUserInfo({ email });

  useLayoutEffect(() => {
    if (isUserLoggedIn) {
      navigate(routes.Home.path);
    } else if (user?.oldEmail === email) {
      enqueueSuccessSnackbar(Strings.message.emailAlreadyVerified);
      navigate(routes.Login.path);
    }
  }, [email, isUserLoggedIn, navigate, user, enqueueSuccessSnackbar]);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const verify = async () => {
    try {
      await Parse.Cloud.run("verifyEmail", { code: otp, email });
    } catch (error: any) {
      console.error(error);
      enqueueErrorSnackbar(Strings.error.verifyingEmail);
      return;
    }
    enqueueSuccessSnackbar(Strings.success.emailVerified);
    navigate(routes.Home.path);
  };

  const resend = async () => {
    try {
      await Parse.Cloud.run("resendVerificationEmail", { email });
    } catch (error: any) {
      console.error(error);
      enqueueErrorSnackbar(Strings.error.resendingVerificationEmail);
      return;
    }
    enqueueSuccessSnackbar(Strings.success.resent);
  };

  const undo = async () => {
    try {
      await Parse.Cloud.run("undoEmailChange", { email });
    } catch (error: any) {
      console.error(error);
      enqueueErrorSnackbar(Strings.error.undoingEmailChange);
      return;
    }
    enqueueSuccessSnackbar(Strings.success.common);
    navigate(routes.Home.path);
  };

  return (
    <PageContainer>
      {email ? (
        <>
          <FancyTitleTypography>
            {Strings.label.verifyEmailTitle}
          </FancyTitleTypography>
          <br />
          <br />
          <Typography className={classes.message}>
            {Strings.message.verifyEmail(email)}
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
              {Strings.action.verify}
            </Button>
          </div>
          <br />
          <br />
          <Typography>{Strings.prompt.didntReceiveCode}</Typography>
          <Button onClick={resend} variant="text" color="warning">
            {Strings.action.resend}
          </Button>
          {user?.oldEmail && (
            <>
              <br />
              <br />
              <Typography variant="caption">
                {Strings.prompt.undoEmailChange}
              </Typography>
              <Button
                onClick={undo}
                variant="text"
                size="small"
                color="warning"
              >
                {Strings.action.undo}
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <Void height="40vh" />
          <br />
          <Typography variant="overline">
            {Strings.error.gettingUserInfo}
          </Typography>
        </>
      )}
    </PageContainer>
  );
});

export default VerifyEmail;
