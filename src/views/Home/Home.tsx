import React, { memo, useMemo, useState } from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { makeStyles, Theme } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  PageContainer,
  AlbumCard,
  AlbumFormDialog,
  useSnackbar,
  BlankCanvas,
  AlbumCardSkeleton,
  Fab,
} from "../../components";
import { Strings } from "../../resources";
import { ParseAlbum } from "../../classes";
import { useUserContext } from "../../contexts";
import { useView } from "../View";
import {
  useInfiniteQueryConfigs,
  useInfiniteScroll,
  useRandomColor,
  useVirtualList,
} from "../../hooks";
import { DEFAULT_PAGE_SIZE } from "../../constants";

const useStyles = makeStyles((theme: Theme) => ({
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
  const { getLoggedInUser } = useUserContext();
  const albums = useMemo(
    () =>
      ParseAlbum.sort(
        data?.pages?.flatMap((page) => page) ?? [],
        getLoggedInUser().favoriteAlbums
      ),
    [data?.pages, getLoggedInUser]
  );
  const { virtualized: virtualizedAlbums, reset: resetVirtualList } =
    useVirtualList({ list: albums, interval: 10, enabled: !!albums?.length });

  const randomColor = useRandomColor();

  return (
    <PageContainer>
      <>
        {status === "success" && !!albums.length ? (
          <Grid item spacing={2} container className={classes.albumsContainer}>
            {virtualizedAlbums.map((album) => (
              <Grid key={album?.name} item xs={12} md={6} lg={4} xl={3}>
                <AlbumCard
                  borderColor={randomColor}
                  onChange={async (_) => {
                    await refetchAlbums();
                    resetVirtualList();
                  }}
                  value={album}
                />
              </Grid>
            ))}
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
      <Fab onClick={() => setAddAlbumDialogOpen(true)}>
        <AddIcon />
      </Fab>
      <AlbumFormDialog
        resetOnConfirm
        value={{
          owner: getLoggedInUser().toPointer(),
          images: [],
          name: Strings.untitledAlbum(),
          collaborators: [],
          viewers: [],
          captions: {},
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
