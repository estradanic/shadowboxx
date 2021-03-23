import React from "react";
import {Container, ContainerProps, Grid} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.secondary.main,
    height: "calc(100vh - 160px)",
    color: theme.palette.primary.contrastText,
  },
  grid: {
    paddingTop: theme.spacing(10),
  },
}));

export interface PageContainerProps extends Omit<ContainerProps, "maxWidth"> {}

const PageContainer = ({children, ...rest}: PageContainerProps) => {
  const classes = useStyles();

  return (
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
  );
};

export default PageContainer;
