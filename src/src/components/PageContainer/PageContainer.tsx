import React from "react";
import { Container, ContainerProps, Grid } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useGlobalLoadingContext } from "../../contexts";
import LoadingWrapper from "../Loader/LoadingWrapper";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.default,
    height: `calc(100vh - ${theme.spacing(19)}px)`,
    color: theme.palette.primary.contrastText,
    overflowY: "auto",
    overflowX: "hidden",
  },
  grid: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(6),
  },
}));

/** Interface defining props for PageContainer */
export interface PageContainerProps extends Omit<ContainerProps, "maxWidth"> {
  /** Whether the page is loading or not */
  loading?: boolean;
}

/** Component to wrap every view in the app */
const PageContainer = ({ children, loading, ...rest }: PageContainerProps) => {
  const classes = useStyles();
  const { globalLoading } = useGlobalLoadingContext();

  return (
    <LoadingWrapper loading={loading || globalLoading}>
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
