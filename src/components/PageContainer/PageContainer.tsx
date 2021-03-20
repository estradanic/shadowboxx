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
    minHeight: ({contentHeight}: any) => {
      switch (contentHeight) {
        case "low": return "calc(100vh - 160px)";
        case "middle": return "calc(75vh - 160px)";
        case "high": return "calc(50vh - 160px)";
        case "top": return "calc(40vh - 160px)";
        default: return "calc(75vh - 160px)";
      }
    },
  },
}));

export interface PageContainerProps extends Omit<ContainerProps, "maxWidth"> {
  contentHeight?: "top" | "high" | "middle" | "low",
}

const PageContainer = ({children, contentHeight = "middle", ...rest}: PageContainerProps) => {
  const classes = useStyles({contentHeight});

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
