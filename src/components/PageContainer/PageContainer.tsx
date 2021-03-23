import React from "react";
import {Container, ContainerProps, Grid} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import LoadingWrapper from "../Loader/LoadingWrapper";
import {useUserContext} from "../../app/UserContext";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.default,
    height: "calc(100vh - 160px)",
    color: theme.palette.primary.contrastText,
  },
  grid: {
    paddingTop: theme.spacing(10),
  },
}));

export interface PageContainerProps extends Omit<ContainerProps, "maxWidth"> {
  loading?: boolean;
}

const PageContainer = ({children, loading, ...rest}: PageContainerProps) => {
  const classes = useStyles();
  const {loggingIn} = useUserContext();

  return (
    <LoadingWrapper loading={loading || loggingIn}>
      <Container maxWidth={false} className={classes.container} {...rest}>
        <Grid
          container
          direction="column"
          alignItems="center"
          justify="center"
          className={classes.grid}
        >
          {children}
        </Grid>
      </Container>
    </LoadingWrapper>
  );
};

export default PageContainer;
