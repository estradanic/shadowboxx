import React, { memo, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import { Strings } from "../../resources";
import { ErrorState, validateEmail } from "../../utils";
import {
  PasswordField,
  Link,
  PageContainer,
  useSnackbar,
  EmailField,
} from "../../components";
import { useNavigate } from "../../hooks";
import { useView } from "../View";
import { useUserContext } from "../../contexts";
import { useGlobalLoadingStore } from "../../stores";
import { UnpersistedParseUser } from "../../classes";
import { routes } from "../../app";

const useStyles = makeStyles((theme: Theme) => ({
  cardTitle: {
    "& *": {
      fontFamily: "Alex Brush",
      color: theme.palette.primary.contrastText,
      width: "fit-content",
      margin: "auto",
    },
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(2, 0),
  },
  submitButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    margin: "auto",
    borderRadius: 0,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const DefaultErrorState = {
  email: { isError: false, errorMessage: "" },
  password: { isError: false, errorMessage: "" },
};

/**
 * Login page for the site
 */
const Login = memo(() => {
  useView("Login");

  const navigate = useNavigate();
  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] =
    useState<ErrorState<"email" | "password">>(DefaultErrorState);
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore(
    (state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
    })
  );
  const { enqueueErrorSnackbar, enqueueWarningSnackbar } = useSnackbar();
  const { updateLoggedInUser } = useUserContext();

  const validate = (): boolean => {
    const newErrors = { ...DefaultErrorState };

    if (!validateEmail(email)) {
      newErrors.email = {
        isError: true,
        errorMessage: Strings.error.invalidEmail(email),
      };
    }
    setErrors(newErrors);
    return !(newErrors.email.isError || newErrors.password.isError);
  };

  const login = () => {
    if (validate()) {
      startGlobalLoader();
      new UnpersistedParseUser({
        username: email.toLocaleLowerCase(),
        password,
      })
        .login(updateLoggedInUser)
        .catch((error) => {
          if (error?.message === "Email not verified") {
            const params = new URLSearchParams();
            params.append("email", email);
            navigate(`${routes.VerifyEmail.path}?${params.toString()}`);
            enqueueWarningSnackbar(error.message);
            return;
          }
          enqueueErrorSnackbar(error?.message ?? Strings.error.loggingIn);
        })
        .finally(() => {
          stopGlobalLoader();
        });
    }
  };

  return (
    <PageContainer>
      <Grid item sm={8}>
        <Card>
          <Grid container direction="row">
            <Grid className={classes.cardTitle} item xs={12}>
              <Typography variant="h4">{Strings.action.login}</Typography>
            </Grid>
            <Grid item xs={12}>
              <EmailField
                validate
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label={Strings.label.email}
                id="email"
                error={errors.email.isError}
                helperText={errors.email.errorMessage}
                onEnterKey={login}
              />
            </Grid>
            <Grid item xs={12}>
              <PasswordField
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label={Strings.label.password}
                id="password"
                error={errors.password.isError}
                helperText={errors.password.errorMessage}
                onEnterKey={login}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                onClick={login}
                fullWidth
                className={classes.submitButton}
                size="large"
              >
                {Strings.action.submit}
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <br />
      <br />
      <Typography variant="h6">{Strings.prompt.noAccount}</Typography>
      <Link saveHistory={false} to={routes.Signup.path}>
        {Strings.action.signup}
      </Link>
      <br />
      <br />
      <Typography variant="h6">{Strings.prompt.forgotPassword}</Typography>
      <Link saveHistory={false} to={routes.ForgotPassword.path}>
        {Strings.action.resetPassword}
      </Link>
    </PageContainer>
  );
});

export default Login;
