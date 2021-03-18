import React from "react";
import Strings from "../../resources/Strings";
import {useView} from "../View";

/**
 * Home page of the site
 * @returns
 */
const Home = () => {
  useView("Home");
  return (
    <div>
      <h1>Home</h1>
      <h4>Welcome to {Strings.appName()}</h4>
    </div>
  );
};

export default Home;
