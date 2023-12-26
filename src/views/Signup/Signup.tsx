import React, { memo, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import { Strings } from "../../resources";
import {
  PasswordField,
  Link,
  PageContainer,
  TextField,
  useSnackbar,
  EmailField,
} from "../../components";
import {
  ErrorState,
  validateEmail,
  validatePassword,
  isNullOrWhitespace,
} from "../../utils";
import routes from "../../app/routes";
import { useGlobalLoadingStore } from "../../stores";
import { UnpersistedParseUser } from "../../classes";
import { useView } from "../View";
import useNavigate from "../../hooks/useNavigate";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: "4px",
  },
  cardTitle: {
    "& *": {
      fontFamily: "Alex Brush",
      color: theme.palette.primary.contrastText,
      width: "fit-content",
      margin: "auto",
    },
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(2, 0),
    borderRadius: 0,
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
  firstName: { isError: false, errorMessage: "" },
  lastName: { isError: false, errorMessage: "" },
  password: { isError: false, errorMessage: "" },
};

/**
 * Signup page for the site
 */
const Signup = memo(() => {
  useView("Signup");

  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [errors, setErrors] =
    useState<ErrorState<"email" | "firstName" | "lastName" | "password">>(
      DefaultErrorState
    );
  const { stopGlobalLoader, startGlobalLoader } = useGlobalLoadingStore(
    (state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
    })
  );
  const navigate = useNavigate();
  const { enqueueErrorSnackbar } = useSnackbar();

  const validate = (): boolean => {
    const newErrors = { ...DefaultErrorState };

    if (!validateEmail(email)) {
      newErrors.email = {
        isError: true,
        errorMessage: Strings.error.invalidEmail(email),
      };
    }
    if (!validatePassword(password)) {
      newErrors.password = {
        isError: true,
        errorMessage: Strings.message.passwordHelperText,
      };
    }
    if (isNullOrWhitespace(firstName)) {
      newErrors.firstName = {
        isError: true,
        errorMessage: Strings.prompt.pleaseEnterA(Strings.label.firstName),
      };
    }
    if (isNullOrWhitespace(lastName)) {
      newErrors.lastName = {
        isError: true,
        errorMessage: Strings.prompt.pleaseEnterA(Strings.label.lastName),
      };
    }

    setErrors(newErrors);
    return !(
      newErrors.email.isError ||
      newErrors.firstName.isError ||
      newErrors.lastName.isError ||
      newErrors.password.isError
    );
  };

  const signup = async () => {
    if (validate()) {
      startGlobalLoader();
      const user = new UnpersistedParseUser({
        username: email.toLocaleLowerCase(),
        password,
        firstName,
        lastName,
      });
      try {
        (await user.signup(async () => {})).logout(async () => {});
        const params = new URLSearchParams();
        params.append("email", email);
        navigate(`${routes.VerifyEmail.path}?${params.toString()}`);
      } catch (error: any) {
        console.error(error);
        enqueueErrorSnackbar(error?.message ?? Strings.error.signingUp);
      } finally {
        stopGlobalLoader();
      }
    }
  };

  return (
    <PageContainer>
      <Grid item md={8}>
        <Card>
          <Grid container direction="row">
            <Grid className={classes.cardTitle} item xs={12}>
              <Typography variant="h4">{Strings.action.signup}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={errors.firstName.isError}
                helperText={errors.firstName.errorMessage}
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                label={Strings.label.firstName}
                id="firstName"
                type="text"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={errors.lastName.isError}
                helperText={errors.lastName.errorMessage}
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                label={Strings.label.lastName}
                id="lastName"
                type="text"
              />
            </Grid>
            <Grid item xs={12}>
              <EmailField
                validate
                error={errors.email.isError}
                helperText={errors.email.errorMessage}
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label={Strings.label.email}
                id="email"
                onEnterKey={signup}
              />
            </Grid>
            <Grid item xs={12}>
              <PasswordField
                validate
                error={errors.password.isError}
                helperText={errors.password.errorMessage}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label={Strings.label.password}
                id="password"
                onEnterKey={signup}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                className={classes.submitButton}
                size="large"
                onClick={signup}
              >
                {Strings.action.submit}
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <br />
      <br />
      <Typography variant="h6">{Strings.prompt.alreadyHaveAccount}</Typography>
      <Link saveHistory={false} to="/login">
        {Strings.action.login}
      </Link>
    </PageContainer>
  );
});

export default Signup;
