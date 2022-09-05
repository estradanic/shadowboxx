import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Parse from "parse";
import { useLocation } from "react-router-dom";
import {
  ParseUser,
  UpdateLoggedInUser,
  UpdateReason,
  User,
  ParseImage,
} from "../types";
import { Strings } from "../resources";
import { routes } from "../app";
import { useNavigate } from "../hooks";

/**
 * Interface defining the return value of the UserContext
 */
interface UserContextValue {
  /** Is a user currently logged in? */
  isUserLoggedIn: boolean;
  /** Function to get currently logged in user */
  getLoggedInUser: () => ParseUser;
  /** Profile picture of the currently logged in user */
  profilePicture?: ParseImage;
  /** Function to set the user on login, signup, or save */
  updateLoggedInUser: UpdateLoggedInUser;
  /** Function to immediately apply updates to the loggedInUser */
  saveLoggedInUserUpdates: () => Promise<void>;
  /** Path to redirect the user to after login */
  redirectPath?: string;
  /** Function to set the redirectPath */
  setRedirectPath: React.Dispatch<React.SetStateAction<string | undefined>>;
}

/**
 * Context to retrieve and manage the logged in user
 */
const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * Interface defining props for UserContextProvider
 */
interface UserContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

/** Custom context provider for UserContext */
export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const initialized = useRef<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedInUser, setLoggedInUser] = useState<ParseUser | undefined>(
    Parse.User.current() ? new ParseUser(Parse.User.current()!) : undefined
  );
  const [profilePicture, setProfilePicture] = useState<
    ParseImage | undefined
  >();
  const [attributes, setAttributes] = useState<User | undefined>(
    loggedInUser ? { ...loggedInUser.attributes } : undefined
  );

  const updateLoggedInUser = useCallback(
    async (newLoggedInUser: ParseUser, reason: UpdateReason) => {
      if (reason === UpdateReason.LOG_OUT) {
        setLoggedInUser(undefined);
        setProfilePicture(undefined);
        navigate(routes.Login.path);
      } else if (
        !loggedInUser ||
        newLoggedInUser.username === loggedInUser.username
      ) {
        if (reason === UpdateReason.LOG_IN || reason === UpdateReason.SIGN_UP) {
          try {
            const userResponse = await newLoggedInUser.fetch();
            if (userResponse) {
              setLoggedInUser(userResponse);
            } else {
              console.error(Strings.couldNotGetUserInfo());
            }
          } catch (error: any) {
            console.error(error?.message ?? Strings.couldNotGetUserInfo());
          }
          if (redirectPath) {
            navigate(redirectPath);
            setRedirectPath(undefined);
          } else if (
            location.pathname === routes.Login.path ||
            location.pathname === routes.Signup.path
          ) {
            navigate(routes.Home.path);
          }
        }
        if (
          newLoggedInUser.profilePicture?.id &&
          (reason === UpdateReason.LOG_IN ||
            reason === UpdateReason.SIGN_UP ||
            newLoggedInUser.profilePicture?.id !== profilePicture?.id)
        ) {
          const profilePictureResponse = await ParseImage.query()
            .equalTo("objectId", newLoggedInUser.profilePicture.id)
            .first();
          if (profilePictureResponse) {
            setProfilePicture(new ParseImage(profilePictureResponse));
          }
        }
      }
    },
    [
      setLoggedInUser,
      setProfilePicture,
      loggedInUser,
      profilePicture?.id,
      history,
      redirectPath,
      location.pathname,
    ]
  );

  const saveLoggedInUserUpdates = async () => {
    if (
      initialized &&
      loggedInUser?.attributes &&
      attributes &&
      !loggedInUser.equals(ParseUser.fromAttributes(attributes))
    ) {
      setLoggedInUser(await loggedInUser.update(updateLoggedInUser));
      setAttributes({ ...loggedInUser.attributes });
    }
  };

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    if (loggedInUser) {
      updateLoggedInUser(loggedInUser, UpdateReason.LOG_IN);
    }
  }, [loggedInUser, updateLoggedInUser, initialized]);

  const getLoggedInUser = () => {
    if (loggedInUser) {
      return loggedInUser;
    }
    navigate(routes.Login.path);
    return ParseUser.NULL;
  };

  const value = {
    getLoggedInUser,
    isUserLoggedIn: !!loggedInUser,
    profilePicture,
    updateLoggedInUser,
    saveLoggedInUserUpdates,
    redirectPath,
    setRedirectPath,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Alias to useContext(UserContext)
 */
export const useUserContext = (): UserContextValue => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("UserContextProvider not found!");
  }
  return context;
};
