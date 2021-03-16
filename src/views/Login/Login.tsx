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
    minHeight: "calc(75vh - 160px)",
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

interface LoginRequest {
  email: string;
  password: string;
}

const DefaultErrorState = {
  email: {isError: false, errorMessage: ""},
  password: {isError: false, errorMessage: ""},
};

const Login = () => {
  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<ErrorState<"email" | "password">>(
    DefaultErrorState,
  );

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

    setErrors(newErrors);
    return !(newErrors.email.isError || newErrors.password.isError);
  };

  const loginSucceed = (response: any) => {
    console.log(response);
  };

  const loginFail = (error: any) => {
    console.log(error);
  };

  const login = () => {
    if (validate()) {
      const loginRequest = {
        email,
        password: md5(password),
      };
      sendHTTPRequest<LoginRequest>({
        method: "POST",
        url: "/api/func_Login",
        data: loginRequest,
        callback: loginSucceed,
        errorCallback: loginFail,
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
        <Grid item sm={8}>
          <Card>
            <Grid container direction="row">
              <Grid className={classes.cardTitle} item xs={12}>
                <Typography variant="h4">{Strings.login()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="filled"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label={Strings.email()}
                  id="email"
                  type="email"
                  error={errors.email.isError}
                  helperText={errors.email.errorMessage}
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordField
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  label={Strings.password()}
                  id="password"
                  error={errors.password.isError}
                  helperText={errors.password.errorMessage}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  onClick={login}
                  fullWidth
                  className={classes.submitButton}
                  size="large"
                >
                  {Strings.submit()}
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <br />
        <br />
        <Typography variant="h6">{Strings.noAccount()}</Typography>
        <Link to="/signup">{Strings.signup()}</Link>
      </Grid>
    </Container>
  );
};

export default Login;
