import React, { useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Card, Grid, Typography, Button } from "@material-ui/core";
import Strings from "../../resources/Strings";
import {
  PasswordField,
  Link,
  PageContainer,
  TextField,
  useSnackbar,
} from "../../components";
import {
  ErrorState,
  validateEmail,
  validatePassword,
} from "../../utils/formUtils";
import { isNullOrWhitespace } from "../../utils/stringUtils";
import { useNavigationContext } from "../../app/NavigationContext";
import { useHistory } from "react-router-dom";
import { useRoutes } from "../../app/routes";
import { useView } from "../View";
import { ParseUser } from "../../types/User";
import { useUserContext } from "../../app/UserContext";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: theme.spacing(0.5),
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
const Signup = () => {
  useView("Signup");

  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [errors, setErrors] = useState<
    ErrorState<"email" | "firstName" | "lastName" | "password">
  >(DefaultErrorState);
  const { setGlobalLoading } = useNavigationContext();
  const { routes } = useRoutes();
  const history = useHistory();
  const { enqueueErrorSnackbar } = useSnackbar();
  const { updateLoggedInUser } = useUserContext();

  const validate = (): boolean => {
    const newErrors = { ...DefaultErrorState };

    if (!validateEmail(email)) {
      newErrors.email = {
        isError: true,
        errorMessage: Strings.invalidEmail(email),
      };
    }
    if (!validatePassword(password)) {
      newErrors.password = {
        isError: true,
        errorMessage: Strings.invalidPassword(password),
      };
    }
    if (isNullOrWhitespace(firstName)) {
      newErrors.firstName = {
        isError: true,
        errorMessage: Strings.pleaseEnterA(Strings.firstName()),
      };
    }
    if (isNullOrWhitespace(lastName)) {
      newErrors.lastName = {
        isError: true,
        errorMessage: Strings.pleaseEnterA(Strings.firstName()),
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

  const signup = () => {
    if (validate()) {
      setGlobalLoading(true);
      const user = ParseUser.fromAttributes({
        username: email,
        password,
        firstName,
        lastName,
      });
      user
        .signup(updateLoggedInUser)
        .then(() => {
          setGlobalLoading(false);
          history.push(routes["Home"].path);
        })
        .catch((error) => {
          setGlobalLoading(false);
          enqueueErrorSnackbar(error?.message ?? Strings.signupError());
        });
    }
  };

  return (
    <PageContainer>
      <Grid item md={8}>
        <Card>
          <Grid container direction="row">
            <Grid className={classes.cardTitle} item xs={12}>
              <Typography variant="h4">{Strings.signup()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={errors.firstName.isError}
                helperText={errors.firstName.errorMessage}
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                label={Strings.firstName()}
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
                label={Strings.lastName()}
                id="lastName"
                type="text"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={errors.email.isError}
                helperText={errors.email.errorMessage}
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label={Strings.email()}
                id="email"
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <PasswordField
                error={errors.password.isError}
                helperText={errors.password.errorMessage}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label={Strings.password()}
                id="password"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                className={classes.submitButton}
                size="large"
                onClick={signup}
              >
                {Strings.submit()}
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <br />
      <br />
      <Typography variant="h6">{Strings.alreadyHaveAccount()}</Typography>
      <Link to="/login">{Strings.login()}</Link>
    </PageContainer>
  );
};

export default Signup;
