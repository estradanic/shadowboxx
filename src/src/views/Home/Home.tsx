import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useView } from "../View";
import {
  PageContainer,
  AlbumCard,
  AlbumFormDialog,
  useSnackbar,
} from "../../components";
import { Fab, Typography, Grid, Button } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Strings from "../../resources/Strings";
import Album from "../../types/Album";
import BlankCanvas from "../../components/Svgs/BlankCanvas";
import { useNavigationContext } from "../../app/NavigationContext";
import Parse from "parse";

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
  const [albums, setAlbums] = useState<Parse.Object<Album>[]>([]);
  const gotAlbums = useRef(false);

  const getAlbums = useCallback(() => {
    if (!gotAlbums.current && !globalLoading) {
      setGlobalLoading(true);
      const currentUser = Parse.User.current();
      if (!currentUser) {
        throw new Error("Not Logged In!");
      }
      new Parse.Query<Parse.Object<Album>>("Album")
        .equalTo("owner", currentUser.toPointer())
        .findAll()
        .then((response) => {
          setAlbums(response);
          setGlobalLoading(false);
          gotAlbums.current = true;
        })
        .catch((error) => {
          enqueueErrorSnackbar(error?.message);
          setGlobalLoading(false);
          gotAlbums.current = true;
        });
    }
  }, [setAlbums, enqueueErrorSnackbar, globalLoading, setGlobalLoading]);

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
                a.get("isFavorite") && b.get("isFavorite")
                  ? a.get("name").localeCompare(b.get("name"))
                  : a.get("isFavorite") && !b.get("isFavorite")
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
                  key={album?.get("name")}
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
        value={
          new Parse.Object<Album>("Album", {
            owner: Parse.User.current()!.toPointer(),
            images: new Parse.Relation(),
            name: "Untitled Album",
            collaborators: new Parse.Relation(),
            viewers: new Parse.Relation(),
            coOwners: new Parse.Relation(),
          })
        }
        open={addAlbumDialogOpen}
        handleCancel={() => setAddAlbumDialogOpen(false)}
        handleConfirm={(value) => {
          setAddAlbumDialogOpen(false);
          value
            .save()
            .then((response) => {
              enqueueSuccessSnackbar(
                Strings.addAlbumSuccess(response?.get("name"))
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
  const [person, setPerson] = useState<any>();

  const addPerson = async () => {
    try {
      const Person = new Parse.Object("Person");
      Person.set("name", "John");
      Person.set("email", "john@back4app.com");
      await Person.save();
      alert("person saved!");
    } catch (error) {
      console.log("Error saving new person: ", error);
    }
  };

  const fetchPerson = async () => {
    const query = new Parse.Query("Person");
    query.equalTo("name", "John");
    const Person = await query.first();
    setPerson(Person);
    alert(
      `Person: {name: ${Person?.get("name")}, email: ${Person?.get(
        "email"
      )}, id: ${Person?.id}}`
    );
  };

  return (
    <>
      <h2>Testing Parse</h2>
      <Button onClick={addPerson}>Add Person</Button>
      <Button onClick={fetchPerson}>Fetch Person</Button>
      {!!person && (
        <div>
          <p>{`Name ${person.get("name")}`}</p>
          <p>{`Email ${person.get("email")}`}</p>
        </div>
      )}
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

  return (
    <PageContainer>
      {Parse.User.current() ? <HomePage /> : <LandingPage />}
    </PageContainer>
  );
};

export default Home;
