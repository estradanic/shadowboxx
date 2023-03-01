import React, { memo, useState } from "react";
import Parse from "parse";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Strings } from "../../resources";
import { ErrorState, validateEmail } from "../../utils";
import {
  PageContainer,
  useSnackbar,
  EmailField,
  Button,
  FancyTitleTypography,
} from "../../components";
import { useNavigate } from "../../hooks";
import { useView } from "../View";
import { routes } from "../../app";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(6),
    justifyContent: "space-between",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  emailField: {
    "&& > p.Mui-error": {
      borderRadius: "0 0 4px 4px",
    },
  },
}));

const DefaultErrorState = {
  email: { isError: false, errorMessage: "" },
};

/**
 * ForgotPassword page for the site
 */
const ForgotPassword = memo(() => {
  useView("ForgotPassword");

  const navigate = useNavigate();
  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<ErrorState<"email">>(DefaultErrorState);
  const { enqueueInfoSnackbar } = useSnackbar();

  const validate = (): boolean => {
    const newErrors = { ...DefaultErrorState };

    if (!validateEmail(email)) {
      newErrors.email = {
        isError: true,
        errorMessage: Strings.error.invalidEmail(email),
      };
    }
    setErrors(newErrors);
    return !newErrors.email.isError;
  };

  const resetPassword = async () => {
    if (!validate()) {
      return;
    }
    await Parse.User.requestPasswordReset(email);
    enqueueInfoSnackbar(Strings.message.passwordChangeEmailSent);
    navigate(routes.Login.path);
  };

  return (
    <PageContainer>
      <FancyTitleTypography>{Strings.prompt.forgotPassword}</FancyTitleTypography>
      <Grid item sm={8} className={classes.container}>
        <EmailField
          validate
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label={Strings.label.email}
          id="email"
          error={errors.email.isError}
          helperText={errors.email.errorMessage}
          onEnterKey={resetPassword}
          fullWidth
          className={classes.emailField}
        />
        <Button
          variant="contained"
          onClick={resetPassword}
          color="primary"
          fullWidth
          size="large"
        >
          {Strings.action.resetPassword}
        </Button>
      </Grid>
    </PageContainer>
  );
});

export default ForgotPassword;
