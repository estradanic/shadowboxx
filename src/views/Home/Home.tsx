import React, { memo, useMemo, useState } from "react";
import Fab from "@material-ui/core/Fab";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  PageContainer,
  AlbumCard,
  AlbumFormDialog,
  useSnackbar,
  BlankCanvas,
  AlbumCardSkeleton,
} from "../../components";
import { Strings } from "../../resources";
import { ParseAlbum } from "../../classes";
import { useUserContext } from "../../contexts";
import { useView } from "../View";
import {
  useInfiniteQueryConfigs,
  useInfiniteScroll,
  useRandomColor,
} from "../../hooks";
import { DEFAULT_PAGE_SIZE } from "../../constants";

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    position: "absolute",
    bottom: theme.spacing(7),
    right: theme.spacing(4),
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.success.dark,
    },
  },
  title: {
    marginRight: "auto",
  },
  albumsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  noAlbumsContainer: {
    textAlign: "center",
  },
  noAlbums: {
    fontSize: "medium",
  },
}));

const Home = memo(() => {
  useView("Home");

  const classes = useStyles();
  const [addAlbumDialogOpen, setAddAlbumDialogOpen] = useState(false);
  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const {
    getAllAlbumsInfiniteFunction,
    getAllAlbumsInfiniteQueryKey,
    getAllAlbumsInfiniteOptions,
  } = useInfiniteQueryConfigs();
  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchAlbums,
  } = useInfiniteQuery<ParseAlbum[], Error>(
    getAllAlbumsInfiniteQueryKey(),
    ({ pageParam: page = 0 }) =>
      getAllAlbumsInfiniteFunction({
        showErrorsInSnackbar: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    getAllAlbumsInfiniteOptions()
  );
  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });
  const albums = useMemo(
    () => data?.pages?.flatMap((page) => page) ?? [],
    [data?.pages]
  );

  const { getLoggedInUser } = useUserContext();
  const randomColor = useRandomColor();

  return (
    <PageContainer>
      <>
        {status === "success" && !!albums.length ? (
          <Grid item spacing={2} container className={classes.albumsContainer}>
            {ParseAlbum.sort(albums, getLoggedInUser().favoriteAlbums).map(
              (album) => (
                <Grid key={album?.name} item xs={12} md={6} lg={4} xl={3}>
                  <AlbumCard
                    borderColor={randomColor}
                    onChange={async (_) => {
                      await refetchAlbums();
                    }}
                    value={album}
                  />
                </Grid>
              )
            )}
          </Grid>
        ) : (
          <>
            {status === "success" || status === "error" ? (
              <Grid item className={classes.noAlbumsContainer}>
                <BlankCanvas height="40vh" />
                <br />
                <Typography className={classes.noAlbums} variant="overline">
                  {Strings.noAlbums()}
                </Typography>
                <br />
                <Typography variant="overline">
                  {Strings.tryAddingAlbum()}
                </Typography>
              </Grid>
            ) : (
              <Grid
                item
                spacing={2}
                container
                className={classes.albumsContainer}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Grid key={i} item xs={12} md={6} lg={4} xl={3}>
                    <AlbumCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </>
      <Fab
        variant="extended"
        onClick={() => setAddAlbumDialogOpen(true)}
        className={classes.fab}
      >
        <AddIcon />
        <Typography>{Strings.addAlbum()}</Typography>
      </Fab>
      <AlbumFormDialog
        resetOnConfirm
        value={{
          owner: getLoggedInUser().toPointer(),
          images: [],
          name: Strings.untitledAlbum(),
          collaborators: [],
          viewers: [],
        }}
        open={addAlbumDialogOpen}
        handleCancel={() => setAddAlbumDialogOpen(false)}
        handleConfirm={async (attributes) => {
          setAddAlbumDialogOpen(false);
          try {
            const response = await ParseAlbum.fromAttributes(
              attributes
            ).saveNew();
            await refetchAlbums();
            enqueueSuccessSnackbar(Strings.addAlbumSuccess(response?.name));
          } catch (error: any) {
            enqueueErrorSnackbar(error?.message ?? Strings.addAlbumError());
          }
        }}
      />
    </PageContainer>
  );
});

export default Home;
