import React from "react";
import Container, { ContainerProps } from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useGlobalLoadingStore } from "../../stores";
import LoadingWrapper from "../Loader/LoadingWrapper";

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    maxWidth: "100vw",
  },
  container: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.contrastText,
    overflowY: "hidden",
    overflowX: "hidden",
    minHeight: `calc(100vh - 8rem)`,
    maxWidth: "100vw",
  },
  grid: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
}));

/** Interface defining props for PageContainer */
export interface PageContainerProps extends Omit<ContainerProps, "maxWidth"> {}

/** Component to wrap every view in the app */
const PageContainer = ({ children, ...rest }: PageContainerProps) => {
  const classes = useStyles();
  const {
    globalLoading,
    globalProgress,
    globalLoaderType,
    globalLoaderContent,
  } = useGlobalLoadingStore((state) => ({
    globalLoading: state.globalLoading,
    globalProgress: state.globalProgress,
    globalLoaderType: state.globalLoaderType,
    globalLoaderContent: state.globalLoaderContent,
  }));

  return (
    <LoadingWrapper
      loading={globalLoading}
      type={globalLoaderType}
      progress={globalProgress}
      content={globalLoaderContent}
      className={classes.wrapper}
    >
      <Container maxWidth={false} className={classes.container} {...rest}>
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          className={classes.grid}
        >
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </Grid>
      </Container>
    </LoadingWrapper>
  );
};

export default PageContainer;
