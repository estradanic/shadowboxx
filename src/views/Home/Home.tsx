import React from "react";
import {useView} from "../View";
import {PageContainer} from "../../components";
import {useUserContext} from "../../app/UserContext";

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
