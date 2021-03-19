import React from "react";
import Strings from "../../resources/Strings";
import {useView} from "../View";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {PageContainer} from "../../components";
import {useUserContext} from "../../app/UserContext";

const useStyles = makeStyles((theme: Theme) => ({}));

const HomePage = () => {
  return <h1>Home page</h1>;
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
