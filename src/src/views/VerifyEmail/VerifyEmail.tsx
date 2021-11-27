import React from "react";
import { Button, Grid, makeStyles, Theme, Typography } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useNavigationContext } from "../../app/NavigationContext";
import { useRoutes } from "../../app/routes";
import { useUserContext } from "../../app/UserContext";
import { PageContainer } from "../../components";
import { useView } from "../View";
import Strings from "../../resources/Strings";

const useStyles = makeStyles((theme: Theme) => ({
  checkButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    margin: "auto",
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const VerifyEmail = () => {
  const classes = useStyles();

  useView("VerifyEmail");

  const { email } = useUserContext();
  const { redirectRoute, setGlobalLoading } = useNavigationContext();
  const history = useHistory();
  const { routes } = useRoutes();

  const checkEmailVerified = () => {};

  return (
    <PageContainer>
      <Grid item sm={8}>
        <Typography variant="h2">{Strings.verifyEmail(email)}</Typography>
        <Button
          onClick={checkEmailVerified}
          size="large"
          className={classes.checkButton}
        >
          {Strings.checkEmailVerified()}
        </Button>
      </Grid>
    </PageContainer>
  );
};

export default VerifyEmail;
