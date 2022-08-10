import React, { memo, useEffect, useRef, useState } from "react";
import Parse from "parse";
import { Fab, Typography, Grid } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  PageContainer,
  AlbumCard,
  AlbumFormDialog,
  useSnackbar,
  BlankCanvas,
} from "../../components";
import { Strings } from "../../resources";
import { ParseAlbum } from "../../types";
import { useGlobalLoadingContext, useUserContext } from "../../contexts";
import { useView } from "../View";

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

const HomePage = memo(() => {
  const classes = useStyles();
  const [addAlbumDialogOpen, setAddAlbumDialogOpen] = useState(false);
  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader, globalLoading } =
    useGlobalLoadingContext();
  const [albums, setAlbums] = useState<ParseAlbum[]>([]);
  const gotAlbums = useRef(false);
  const { loggedInUser } = useUserContext();

  useEffect(() => {
    if (!gotAlbums.current && !globalLoading) {
      gotAlbums.current = true;
      startGlobalLoader();
      ParseAlbum.query()
        .findAll()
        .then(async (response) => {
          await Parse.Object.pinAll(response);
          setAlbums(response.map((album) => new ParseAlbum(album)));
        })
        .catch((error) => {
          enqueueErrorSnackbar(error?.message);
          gotAlbums.current = false;
        })
        .finally(() => {
          stopGlobalLoader();
        });
    }
  }, [
    setAlbums,
    enqueueErrorSnackbar,
    globalLoading,
    startGlobalLoader,
    stopGlobalLoader,
    loggedInUser,
  ]);

  return (
    <>
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
                  onChange={async (changedAlbum) => {
                    const newAlbums = [...albums];
                    if (changedAlbum !== null) {
                      newAlbums[index] = changedAlbum;
                    } else {
                      newAlbums.splice(index, 1);
                    }
                    gotAlbums.current = false;
                    setAlbums(newAlbums);
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
        <Add />
        <Typography>{Strings.addAlbum()}</Typography>
      </Fab>
      <AlbumFormDialog
        resetOnConfirm
        value={{
          owner: loggedInUser!.toPointer(),
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
            setAlbums((prev) => [...prev, response]);
            enqueueSuccessSnackbar(Strings.addAlbumSuccess(response?.name));
          } catch (error: any) {
            enqueueErrorSnackbar(error?.message ?? Strings.addAlbumError());
          }
        }}
      />
    </>
  );
});

const LandingPage = () => {
  return (
    <>
      <h2>Testing Parse</h2>
    </>
  );
};

/**
 * Home page of the site.
 * Either a landing page if not logged in,
 * Or the user's homepage if logged in.
 */
const Home = () => {
  useView("Home");
  const { loggedInUser } = useUserContext();

  return (
    <PageContainer>
      {loggedInUser ? <HomePage /> : <LandingPage />}
    </PageContainer>
  );
};

export default Home;
