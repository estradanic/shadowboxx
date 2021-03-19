import React from "react";
import {Container, ContainerProps, Grid} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.primary.light,
    height: "calc(100vh - 160px)",
    color: theme.palette.primary.contrastText,
  },
  grid: {
    minHeight: "calc(75vh - 160px)",
  },
}));

export interface PageContainerProps extends Omit<ContainerProps, "maxWidth"> {}

const PageContainer = ({children, ...rest}: PageContainerProps) => {
  const classes = useStyles();

  return (
    <Container maxWidth={false} className={classes.container}>
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
