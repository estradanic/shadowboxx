import React, { useState, createContext, useContext } from "react";
import { useSnackbar } from "../components";
import Strings from "../resources/Strings";
import { useNavigationContext } from "./NavigationContext";
import Parse, { Error } from "parse";

export type ParseFile = Parse.File | null;

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
  profilePicture: ParseFile;
  /** React state setter for profilePicture */
  setProfilePicture: React.Dispatch<React.SetStateAction<ParseFile>>;
  /** Helper function to be called on a successful signup */
  signupSucceed: (user: Parse.User) => void;
  /** Helper function to be called on a successful login */
  loginSucceed: (user: Parse.User) => void;
  /** Helper function to be called on a failed login */
  loginFail: (error: Error) => void;
  /** Helper function to log out the user */
  logout: () => void;
  /** Whether or not darkTheme is enabled */
  isDarkThemeEnabled: boolean;
  /** React state setter for isDarkThemeEnabled */
  setDarkThemeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Context to manage user info and authentication
 */
const UserContext = createContext<UserContextValue>({
  loggedIn: false,
  setLoggedIn: (_: boolean | ((_: boolean) => boolean)) => {},
  email: "",
  setEmail: (_: string | ((_: string) => string)) => {},
  firstName: "",
  setFirstName: (_: string | ((_: string) => string)) => {},
  lastName: "",
  setLastName: (_: string | ((_: string) => string)) => {},
  profilePicture: null,
  setProfilePicture: (_: ParseFile | ((_: ParseFile) => ParseFile)) => {},
  loginSucceed: (_: Parse.User) => {},
  signupSucceed: (_: Parse.User) => {},
  loginFail: (_: Error) => {},
  logout: () => {},
  isDarkThemeEnabled: false,
  setDarkThemeEnabled: (_: boolean | ((_: boolean) => boolean)) => {},
});

/**
 * Interface defining props for the UserContextProvider
 */
interface UserContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

/** Custom context provider for UserContext */
export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<ParseFile>(null);
  const [isDarkThemeEnabled, setDarkThemeEnabled] = useState<boolean>(false);
  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const { setGlobalLoading } = useNavigationContext();

  const signupSucceed = (user: Parse.User) => {
    setGlobalLoading(false);
    setEmail(user.getEmail() ?? "");
    setFirstName(user.get("firstName"));
    setLastName(user.get("lastName"));
    enqueueSuccessSnackbar(
      Strings.welcomeUser({
        firstName: user.get("firstName"),
        lastName: user.get("lastName"),
      })
    );
  };

  const loginSucceed = (user: Parse.User) => {
    signupSucceed(user);
    setProfilePicture(
      user.get("profilePicture") ?? { src: "", fileName: "", alt: "" }
    );
    setDarkThemeEnabled(user.get("isDarkThemeEnabled") ?? false);
    setLoggedIn(true);
  };

  const loginFail = (error: Error) => {
    setGlobalLoading(false);
    if (error?.message) {
      enqueueErrorSnackbar(error.message);
    } else {
      enqueueErrorSnackbar(Strings.commonError());
    }
  };

  const logout = () => {
    Parse.User.logOut().then(() => {
      setEmail("");
      setFirstName("");
      setLastName("");
      setLoggedIn(false);
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
    signupSucceed,
    loginFail,
    logout,
    isDarkThemeEnabled,
    setDarkThemeEnabled,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/** Alias to useContext(UserContext) */
export const useUserContext = () => useContext(UserContext);
