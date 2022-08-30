import React, { memo, useState } from "react";
import Fab from "@material-ui/core/Fab";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useQuery } from "@tanstack/react-query";
import {
  PageContainer,
  AlbumCard,
  AlbumFormDialog,
  useSnackbar,
  BlankCanvas,
  AlbumCardSkeleton,
} from "../../components";
import { Strings } from "../../resources";
import { ParseAlbum } from "../../types";
import { useUserContext } from "../../contexts";
import { useView } from "../View";
import { useRequests } from "../../hooks";

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    position: "absolute",
    bottom: theme.spacing(5),
    right: theme.spacing(5),
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
  const { getAllAlbumsFunction, getAllAlbumsQueryKey, getAllAlbumsOptions } =
    useRequests();
  const { getLoggedInUser } = useUserContext();
  const {
    data: albums,
    refetch: refetchAlbums,
    status,
  } = useQuery<ParseAlbum[], Error>(
    getAllAlbumsQueryKey(),
    () => getAllAlbumsFunction({ showErrorsInSnackbar: true }),
    getAllAlbumsOptions()
  );

  return (
    <PageContainer>
      <>
        {status === "success" && !!albums.length ? (
          <Grid item spacing={2} container className={classes.albumsContainer}>
            {[...albums]
              .sort((a, b) =>
                a.isFavorite && b.isFavorite
                  ? a.name.localeCompare(b.name)
                  : a.isFavorite && !b.isFavorite
                  ? -1
                  : 1
              )
              .map((album) => (
                <Grid key={album?.name} item xs={12} md={6} lg={4} xl={3}>
                  <AlbumCard
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
              <>
                <AlbumCardSkeleton />
                <AlbumCardSkeleton />
                <AlbumCardSkeleton />
                <AlbumCardSkeleton />
                <AlbumCardSkeleton />
                <AlbumCardSkeleton />
              </>
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
            const response = await ParseAlbum.fromAttributes(attributes).save();
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
