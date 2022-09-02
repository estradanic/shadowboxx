import React from "react";
import Container, { ContainerProps } from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
export interface PageContainerProps extends Omit<ContainerProps, "maxWidth"> {}

/** Component to wrap every view in the app */
const PageContainer = ({ children, ...rest }: PageContainerProps) => {
  const classes = useStyles();
  const {
    globalLoading,
    globalProgress,
    globalLoaderType,
    globalLoaderContent,
  } = useGlobalLoadingContext();

  return (
    <LoadingWrapper
      loading={globalLoading}
      type={globalLoaderType}
      progress={globalProgress}
      content={globalLoaderContent}
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