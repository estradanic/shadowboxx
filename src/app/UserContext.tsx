import React, {useState, createContext, useContext} from "react";
import {sendHTTPRequest} from "../utils/requestUtils";
import {useSnackbar} from "../components";
import Strings from "../resources/Strings";

export type ProfilePicture = {src: string, name: string};

/**
 * Interface defining information about the logged in user
 */
export interface UserInfo {
  /** User's email */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's password */
  password?: string;
  /** User's profile picture */
  profilePicture?: ProfilePicture;
}

/**
 * Interface defining the return value of the UserContext
 */
interface UserContextValue {
  /** Whether the user is logged in or not */
  loggedIn: boolean;
  /** React State setter for loggedIn */
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  /** User's email */
  email: string;
  /** React State setter for email */
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  /** User's first name */
  firstName: string;
  /** React State setter for firstName */
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  /** User's last name */
  lastName: string;
  /** React State setter for lastName */
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  /** User's profile picture */
  profilePicture: ProfilePicture;
  /** React state setter for profilePicture */
  setProfilePicture: React.Dispatch<React.SetStateAction<ProfilePicture>>;
  /** Helper function to be called on a successful login */
  loginSucceed: (info: UserInfo) => void;
  /** Helper function to be called on a failed login */
  loginFail: (error: string) => void;
  /** Helper function to log out the user */
  logout: () => void;
}

/**
 * Context to manage user info and authentication
 */
const UserContext = createContext({
  loggedIn: false,
  setLoggedIn: (_: boolean | ((_: boolean) => boolean)) => {},
  email: "",
  setEmail: (_: string | ((_: string) => string)) => {},
  firstName: "",
  setFirstName: (_: string | ((_: string) => string)) => {},
  lastName: "",
  setLastName: (_: string | ((_: string) => string)) => {},
  profilePicture: {src: "", name: ""},
  setProfilePicture: (_: ProfilePicture | ((_: ProfilePicture) => ProfilePicture)) => {},
  loginSucceed: (_: UserInfo) => {},
  loginFail: (_: string) => {},
  logout: () => {},
});

/**
 * Interface defining props for the UserContextProvider
 */
interface UserContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

/** Custom context provider for UserContext */
export const UserContextProvider = ({children}: UserContextProviderProps) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<ProfilePicture>({src: "", name: ""});
  const {enqueueErrorSnackbar, enqueueSuccessSnackbar} = useSnackbar();

  const loginSucceed = (info: UserInfo) => {
    setEmail(info.email);
    setFirstName(info.firstName);
    setLastName(info.lastName);
    setLoggedIn(true);
    enqueueSuccessSnackbar(
      Strings.welcomeUser({firstName: info.firstName, lastName: info.lastName}),
    );
  };

  const loginFail = (error: string) => {
    if (error) {
      enqueueErrorSnackbar(error);
    } else {
      enqueueErrorSnackbar(Strings.commonError());
    }
  };

  const logout = () => {
    sendHTTPRequest<never, never>({
      method: "POST",
      url: "/api/func_Logout",
      callback: () => {
        setEmail("");
        setFirstName("");
        setLastName("");
        setLoggedIn(false);
      },
    });
  };

  const value: UserContextValue = {
    loggedIn,
    setLoggedIn,
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    profilePicture,
    setProfilePicture,
    loginSucceed,
    loginFail,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/** Alias to useContext(UserContext) */
export const useUserContext = () => useContext(UserContext);
