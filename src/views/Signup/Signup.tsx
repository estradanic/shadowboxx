import React, {useState} from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {
  Container,
  Card,
  TextField,
  Grid,
  Typography,
  Button,
} from "@material-ui/core";
import Strings from "../../resources/Strings";
import {PasswordField, Link} from "../../components";
import {sendHTTPRequest} from "../../utils/requestUtils";
import md5 from "md5";
import {
  ErrorState,
  validateEmail,
  validatePassword,
} from "../../utils/formUtils";
import {isNullOrWhitespace} from "../../utils/stringUtils";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.primary.light,
    height: "calc(100vh - 160px)",
    color: theme.palette.primary.contrastText,
  },
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
  grid: {
    minHeight: "calc(85vh - 160px)",
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

interface SignupRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

const DefaultErrorState = {
  email: {isError: false, errorMessage: ""},
  firstName: {isError: false, errorMessage: ""},
  lastName: {isError: false, errorMessage: ""},
  password: {isError: false, errorMessage: ""},
};

const Signup = () => {
  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [errors, setErrors] = useState<
    ErrorState<"email" | "firstName" | "lastName" | "password">
  >(DefaultErrorState);

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

  const signupSucceed = (response: unknown) => {
    console.log(response);
  };

  const signupFail = (error: unknown) => {
    console.log(error);
  };

  const signup = () => {
    if (validate()) {
      const signupRequest = {
        email,
        firstName,
        lastName,
        password: md5(password),
      };
      sendHTTPRequest<SignupRequest>({
        method: "POST",
        url: "/api/func_Signup",
        data: signupRequest,
        callback: signupSucceed,
        errorCallback: signupFail,
      });
    }
  };

  return (
    <Container maxWidth="xl" className={classes.container}>
      <Grid
        container
        direction="column"
        alignItems="center"
        justify="center"
        className={classes.grid}
      >
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
      </Grid>
    </Container>
  );
};

export default Signup;
