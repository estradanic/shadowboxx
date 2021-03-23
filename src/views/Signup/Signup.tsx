import React, {useState} from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Card, TextField, Grid, Typography, Button} from "@material-ui/core";
import Strings from "../../resources/Strings";
import {PasswordField, Link, PageContainer} from "../../components";
import {sendHTTPRequest} from "../../utils/requestUtils";
import md5 from "md5";
import {
  ErrorState,
  validateEmail,
  validatePassword,
} from "../../utils/formUtils";
import {isNullOrWhitespace} from "../../utils/stringUtils";
import {UserInfo, useUserContext} from "../../app/UserContext";
import {useNavigationContext} from "../../app/NavigationContext";
import {useHistory} from "react-router-dom";
import {useRoutes} from "../../app/routes";
import {useView} from "../View";

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

/**
 * Interface defining the body of a signup request
 */
interface SignupRequest {
  /** User's email */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** Md5 hash of the user's password */
  password: string;
}

const DefaultErrorState = {
  email: {isError: false, errorMessage: ""},
  firstName: {isError: false, errorMessage: ""},
  lastName: {isError: false, errorMessage: ""},
  password: {isError: false, errorMessage: ""},
};

/**
 * Signup page for the site
 * @returns
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
  const {redirectRoute} = useNavigationContext();
  const {routes} = useRoutes();
  const history = useHistory();
  const {loginSucceed, loginFail, setLoggingIn} = useUserContext();

  const validate = (): boolean => {
    const newErrors = {...DefaultErrorState};

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
      const signupRequest = {
        email,
        firstName,
        lastName,
        password: md5(password),
      };
      setLoggingIn(true);
      sendHTTPRequest<SignupRequest, UserInfo>({
        method: "POST",
        url: "/api/func_Signup",
        data: signupRequest,
        callback: (response: UserInfo) => {
          loginSucceed(response);
          if (redirectRoute?.viewId) {
            history.push(redirectRoute.path);
          } else {
            history.push(routes["Home"].path);
          }
        },
        errorCallback: loginFail,
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
                variant="filled"
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
                variant="filled"
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
                variant="filled"
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
