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
    flexWrap: "wrap",
    paddingBottom: theme.spacing(20),
    alignSelf: "center",
    maxWidth: "100%",
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
  const { data: albums, refetch: refetchAlbums } = useQuery<
    ParseAlbum[],
    Error
  >(
    getAllAlbumsQueryKey(),
    () => getAllAlbumsFunction({ showErrorsInSnackbar: true }),
    getAllAlbumsOptions()
  );

  return (
    <PageContainer>
      <Grid container direction="column">
        {!!albums.length ? (
          <Grid item className={classes.albumsContainer}>
            {[...albums]
              .sort((a, b) =>
                a.isFavorite && b.isFavorite
                  ? a.name.localeCompare(b.name)
                  : a.isFavorite && !b.isFavorite
                  ? -1
                  : 1
              )
              .map((album, index) => (
                <AlbumCard
                  onChange={async (_) => {
                    await refetchAlbums();
                  }}
                  value={album}
                  key={album?.name}
                />
              ))}
          </Grid>
        ) : (
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
        )}
      </Grid>
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
