import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Parse from "parse";
import Typography from "@material-ui/core/Typography";
import { useSearchParams } from "react-router-dom";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  PageContainer,
  FancyTitleTypography,
  OtpField,
  Button,
  useSnackbar,
} from "../../components";
import { Strings } from "../../resources";
import { routes } from "../../app";
import { useNavigate } from "../../hooks";
import { useUserContext } from "../../contexts";

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
  const classes = useStyles();

  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { isUserLoggedIn } = useUserContext();

  useLayoutEffect(() => {
    if (isUserLoggedIn) {
      navigate(routes.Home.path);
    }
  }, [isUserLoggedIn, navigate]);

  const [search] = useSearchParams();
  const email = search.get("email");
  const [otp, setOtp] = useState("");

  const buttonRef = useRef<HTMLButtonElement>(null);

  const verify = async () => {
    try {
      await Parse.Cloud.run("verifyEmail", { code: otp, email });
    } catch (error: any) {
      enqueueErrorSnackbar(error?.message ?? Strings.commonError());
      return;
    }
    enqueueSuccessSnackbar(Strings.emailVerified());
    navigate(routes.Home.path);
  };

  const resend = async () => {
    try {
      await Parse.Cloud.run("resendVerificationEmail", { email });
    } catch (error: any) {
      enqueueErrorSnackbar(error?.message ?? Strings.commonError());
      return;
    }
    enqueueSuccessSnackbar(Strings.resent());
  };

  const undo = async () => {
    try {
      await Parse.Cloud.run("undoEmailChange", { email });
    } catch (error: any) {
      enqueueErrorSnackbar(error?.message ?? Strings.commonError());
      return;
    }
    enqueueSuccessSnackbar(Strings.commonSaved());
    navigate(routes.Home.path);
  };

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
          <br />
          <br />
          <Typography>{Strings.verifyEmailResend()}</Typography>
          <Button onClick={resend} variant="text" color="warning">
            {Strings.resend()}
          </Button>
          <br />
          <br />
          <Typography variant="caption">{Strings.undoEmailChange()}</Typography>
          <Button onClick={undo} variant="text" size="small" color="warning">
            {Strings.undo()}
          </Button>
        </>
      )}
    </PageContainer>
  );
});

export default VerifyEmail;
