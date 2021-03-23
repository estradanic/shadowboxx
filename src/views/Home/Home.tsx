import React from "react";
import {useView} from "../View";
import {PageContainer, AlbumCard} from "../../components";
import {useUserContext} from "../../app/UserContext";
import {Fab, Typography, Grid} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {makeStyles, Theme} from "@material-ui/core/styles";
import Strings from "../../resources/Strings";

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    position: "absolute",
    bottom: theme.spacing(10),
    right: theme.spacing(5),
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.success.dark,
    },
  },
  title: {
    marginRight: "auto",
  },
}));

const HomePage = () => {
  const classes = useStyles();

  return (
    <>
      <Grid container direction="column">
        <Grid item>
          <AlbumCard
            name="Album"
            lastEdited={new Date()}
            created={new Date()}
            numOfPhotos={128}
            coverImgSrc="https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?ixid=MXwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60"
            coverImgName="Cover Image"
            description="The Demo Album with a long description"
            favorite={true}
          />
        </Grid>
      </Grid>
      <Fab variant="extended" className={classes.fab}>
        <Add />
        <Typography>{Strings.addAlbum()}</Typography>
      </Fab>
    </>
  );
};

const LandingPage = () => {
  return <h1>Landing Page</h1>;
};

/**
 * Home page of the site.
 * Either a landing page if not logged in,
 * Or the user's homepage if logged in.
 * @returns
 */
const Home = () => {
  useView("Home");

  const {loggedIn} = useUserContext();
  return (
    <PageContainer>{loggedIn ? <HomePage /> : <LandingPage />}</PageContainer>
  );
};

export default Home;
