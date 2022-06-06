import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useView } from "../View";
import {
  PageContainer,
  AlbumCard,
  AlbumFormDialog,
  useSnackbar,
} from "../../components";
import { Fab, Typography, Grid } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Strings from "../../resources/Strings";
import ParseAlbum from "../../types/Album";
import BlankCanvas from "../../components/Svgs/BlankCanvas";
import { useNavigationContext } from "../../app/NavigationContext";
import { useUserContext } from "../../app/UserContext";

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
  const { setGlobalLoading, globalLoading } = useNavigationContext();
  const [albums, setAlbums] = useState<ParseAlbum[]>([]);
  const gotAlbums = useRef(false);
  const { loggedInUser } = useUserContext();

  const getAlbums = useCallback(() => {
    if (!gotAlbums.current && !globalLoading) {
      setGlobalLoading(true);
      ParseAlbum.query()
        .equalTo(ParseAlbum.COLUMNS.owner, loggedInUser!.email)
        .findAll()
        .then((response) => {
          setAlbums(response.map((album) => new ParseAlbum(album)));
          setGlobalLoading(false);
          gotAlbums.current = true;
        })
        .catch((error) => {
          enqueueErrorSnackbar(error?.message);
          setGlobalLoading(false);
          gotAlbums.current = true;
        });
    }
  }, [
    setAlbums,
    enqueueErrorSnackbar,
    globalLoading,
    setGlobalLoading,
    loggedInUser,
  ]);

  useEffect(() => {
    getAlbums();
  }, [getAlbums]);

  return (
    <>
      <Grid container direction="column">
        {!!albums.length ? (
          <Grid item className={classes.albumsContainer}>
            {albums
              .sort((a, b) =>
                a.isFavorite && b.isFavorite
                  ? a.name.localeCompare(b.name)
                  : a.isFavorite && !b.isFavorite
                  ? -1
                  : 1
              )
              .map((album) => (
                <AlbumCard
                  onChange={() => {
                    gotAlbums.current = false;
                    getAlbums();
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
        value={ParseAlbum.fromAttributes({
          owner: loggedInUser!.email,
          images: [],
          name: Strings.untitledAlbum(),
          collaborators: [],
          viewers: [],
          coOwners: [],
        })}
        open={addAlbumDialogOpen}
        handleCancel={() => setAddAlbumDialogOpen(false)}
        handleConfirm={(value) => {
          setAddAlbumDialogOpen(false);
          value._album
            .save()
            .then((response) => {
              const responseAlbum = new ParseAlbum(response);
              enqueueSuccessSnackbar(
                Strings.addAlbumSuccess(responseAlbum?.name)
              );
            })
            .catch((error) => {
              enqueueErrorSnackbar(error?.message ?? Strings.addAlbumError());
            });
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
