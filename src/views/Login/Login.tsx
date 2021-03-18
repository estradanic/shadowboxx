import React, {useState} from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {
  Container,
  Card,
  TextField,
  Grid,
  Typography,
  Button,
  Snackbar,
} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import Strings from "../../resources/Strings";
import {PasswordField, Link} from "../../components";
import {sendHTTPRequest} from "../../utils/requestUtils";
import md5 from "md5";
import {
  ErrorState,
  validateEmail,
  validatePassword,
} from "../../utils/formUtils";
import {useUserContext, UserInfo} from "../../app/UserContext";
import {useNavigationContext} from "../../app/NavigationContext";
import {useHistory} from "react-router-dom";
import {useRoutes} from "../../app/routes";
import {useView} from "../View";

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

/**
 * Interface defining the body for a login request
 */
interface LoginRequest {
  /** User's email */
  email: string;
  /** Md5 hash of the user's password */
  password: string;
}

const DefaultErrorState = {
  email: {isError: false, errorMessage: ""},
  password: {isError: false, errorMessage: ""},
};

/**
 * Login page for the site
 * @returns
 */
const Login = () => {
  useView("Login");

  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorOpen, setErrorOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errors, setErrors] = useState<ErrorState<"email" | "password">>(
    DefaultErrorState,
  );
  const {loginSucceed} = useUserContext();
  const {redirectRoute} = useNavigationContext();
  const history = useHistory();
  const {routes} = useRoutes();

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

  const loginFail = (error: any) => {
    setErrorMessage(error as string);
    setErrorOpen(true);
  };

  const handleErrorClose = (_: any, reason: string) => {
    if (reason !== "clickaway") {
      setErrorOpen(false);
    }
  };

  const login = () => {
    if (validate()) {
      const loginRequest = {
        email,
        password: md5(password),
      };
      sendHTTPRequest<LoginRequest, UserInfo>({
        method: "POST",
        url: "/api/func_Login",
        data: loginRequest,
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
      <Snackbar
        open={errorOpen}
        autoHideDuration={3000}
        onClose={handleErrorClose}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
