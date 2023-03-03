import React, { memo, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles, Theme } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  PageContainer,
  AlbumCard,
  AlbumFormDialog,
  useSnackbar,
  AlbumCardSkeleton,
  Fab,
  Online,
} from "../../components";
import { Strings } from "../../resources";
import { ParseAlbum } from "../../classes";
import { useView } from "../View";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import NoAlbums from "../../components/Albums/NoAlbums";
import { UnpersistedParseAlbum } from "../../classes";
import useRandomColor from "../../hooks/useRandomColor";
import useVirtualList from "../../hooks/useVirtualList";
import useFlatInfiniteQueryData from "../../hooks/Query/useFlatInfiniteQueryData";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import useInfiniteQueryConfigs from "../../hooks/Query/useInfiniteQueryConfigs";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import { useUserContext } from "../../contexts/UserContext";

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
  const { online } = useNetworkDetectionContext();
  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchAlbums,
  } = useInfiniteQuery<ParseAlbum[], Error>(
    getAllAlbumsInfiniteQueryKey(),
    ({ pageParam: page = 0 }) =>
      getAllAlbumsInfiniteFunction(online, {
        showErrorsInSnackbar: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    getAllAlbumsInfiniteOptions()
  );
  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });
  const { getLoggedInUser } = useUserContext();

  const albums = useFlatInfiniteQueryData(data);
  const virtualizedAlbums = useVirtualList(albums);

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
                  }}
                  value={album}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            {status === "success" || status === "error" ? (
              <NoAlbums />
            ) : (
              <Grid
                item
                spacing={2}
                container
                className={classes.albumsContainer}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Grid key={`skeleton-${i}`} item xs={12} md={6} lg={4} xl={3}>
                    <AlbumCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </>
      <Online>
        <Fab onClick={() => setAddAlbumDialogOpen(true)}>
          <AddIcon />
        </Fab>
      </Online>
      <AlbumFormDialog
        resetOnConfirm
        value={{
          owner: getLoggedInUser().toPointer(),
          images: [],
          name: Strings.label.untitledAlbum,
          collaborators: [],
          viewers: [],
          captions: {},
        }}
        open={addAlbumDialogOpen}
        handleCancel={() => setAddAlbumDialogOpen(false)}
        handleConfirm={async (attributes) => {
          setAddAlbumDialogOpen(false);
          try {
            const response = await new UnpersistedParseAlbum(
              attributes
            ).saveNew();
            await refetchAlbums();
            enqueueSuccessSnackbar(Strings.success.addingAlbum(response?.name));
          } catch (error: any) {
            console.error(error);
            enqueueErrorSnackbar(Strings.error.addingAlbum);
          }
        }}
      />
    </PageContainer>
  );
});

export default Home;
