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

const Signup = () => {
  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
                  variant="filled"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label={Strings.firstName()}
                  id="firstName"
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="filled"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label={Strings.lastName()}
                  id="lastName"
                  type="text"
                />
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
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordField
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  label={Strings.password()}
                  id="password"
                />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth className={classes.submitButton} size="large">
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
