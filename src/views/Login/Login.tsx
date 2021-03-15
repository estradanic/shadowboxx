import React, {useState} from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Container, Card, TextField, Grid, Typography} from "@material-ui/core";
import Strings from "../../resources/Strings";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.primary.light,
    height: "calc(100vh - 160px)",
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
    padding: theme.spacing(2, 0)
  },
  grid: {
    minHeight: "calc(75vh - 160px)",
  },
}));

const Login = () => {
  const classes = useStyles();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <Container maxWidth="xl" className={classes.container}>
      <Grid container direction="column" alignItems="center" justify="center" className={classes.grid}>
        <Card>
          <Grid container direction="row">
            <Grid className={classes.cardTitle} item xs={12}>
              <Typography variant="h4">{Strings.login()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField variant="filled" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} label={Strings.email()} id="email" type="email" />
            </Grid>
            <Grid item xs={12}>
              <TextField variant="filled" fullWidth value={password} onChange={(e) => setPassword(e.target.value)}label={Strings.password()} id="password" type="password" />
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Container>
  );
};

export default Login;
