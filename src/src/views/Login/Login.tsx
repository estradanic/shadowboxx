import React, { useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Card, Grid, Typography, Button } from "@material-ui/core";
import Strings from "../../resources/Strings";
import {
  PasswordField,
  Link,
  PageContainer,
  TextField,
} from "../../components";
import { ErrorState, validateEmail } from "../../utils/formUtils";
import { useUserContext } from "../../app/UserContext";
import { useNavigationContext } from "../../app/NavigationContext";
import { useHistory } from "react-router-dom";
import { useRoutes } from "../../app/routes";
import { useView } from "../View";
import Parse from "parse";

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
const Login = () => {
  useView("Login");

  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<ErrorState<"email" | "password">>(
    DefaultErrorState
  );
  const { loginSucceed, loginFail } = useUserContext();
  const { redirectRoute, setGlobalLoading } = useNavigationContext();
  const history = useHistory();
  const { routes } = useRoutes();

  const validate = (): boolean => {
    const newErrors = { ...DefaultErrorState };

    if (!validateEmail(email)) {
      newErrors.email = {
        isError: true,
        errorMessage: Strings.invalidEmail(email),
      };
    }
    setErrors(newErrors);
    return !(newErrors.email.isError || newErrors.password.isError);
  };

  const login = () => {
    if (validate()) {
      setGlobalLoading(true);
      const user = new Parse.User();
      user.set("username", email);
      user.set("password", password);
      user
        .logIn()
        .then((response) => {
          if (response.get("emailVerified")) {
            loginSucceed(response);
            if (redirectRoute?.viewId) {
              history.push(redirectRoute.path);
            } else {
              history.push(routes["Home"].path);
            }
          } else {
            history.push(routes["VerifyEmail"].path);
          }
        })
        .catch(loginFail);
    }
  };

  return (
    <PageContainer>
      <Grid item sm={8}>
        <Card>
          <Grid container direction="row">
            <Grid className={classes.cardTitle} item xs={12}>
              <Typography variant="h4">{Strings.login()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
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
    </PageContainer>
  );
};

export default Login;
