import React, {useState, createContext, useContext} from "react";
import {sendHTTPRequest} from "../utils/requestUtils";
import {useSnackbar} from "../components";
import Strings from "../resources/Strings";

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
    loginSucceed,
    loginFail,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/** Alias to useContext(UserContext) */
export const useUserContext = () => useContext(UserContext);
