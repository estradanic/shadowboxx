import React from "react";
import {useView} from "../View";
import {PageContainer} from "../../components";
import {useUserContext} from "../../app/UserContext";

/**
 * Settings page for the user.
 */
const Settings = () => {
  useView("Settings");

  const {firstName, lastName, email} = useUserContext();

  return (
    <PageContainer>
      <h1>Settings page</h1>
      <ul>
        <li>Name: {`${firstName} ${lastName}`}</li>
        <li>Email: {email}</li>
      </ul>
    </PageContainer>
  );
};

export default Settings;
