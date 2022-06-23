import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Parse from "parse";
import useInterval from "use-interval";
import { useHistory, useLocation } from "react-router-dom";
import {
  ParseUser,
  UpdateLoggedInUser,
  UpdateReason,
  User,
  ParseImage,
  Image,
} from "../types";
import { Strings } from "../resources";
import { routes } from "../app";

/**
 * Interface defining the return value of the UserContext
 */
interface UserContextValue {
  /** Currently logged in user */
  loggedInUser?: ParseUser;
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
  const history = useHistory();
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
    (newLoggedInUser: ParseUser, reason: UpdateReason) => {
      if (reason === UpdateReason.LOG_OUT) {
        setLoggedInUser(undefined);
        setProfilePicture(undefined);
      } else if (
        !loggedInUser ||
        newLoggedInUser.username === loggedInUser.username
      ) {
        if (reason === UpdateReason.LOG_IN || reason === UpdateReason.SIGN_UP) {
          newLoggedInUser.fetch().then((userResponse) => {
            if (userResponse) {
              setLoggedInUser(userResponse);
            } else {
              console.error(Strings.couldNotGetUserInfo());
            }
          });
          if (redirectPath) {
            history.push(redirectPath);
            setRedirectPath(undefined);
          } else if (
            location.pathname === routes["Login"].path ||
            location.pathname === routes["Signup"].path
          ) {
            history.push(routes["Home"].path);
          }
        }
        if (
          reason === UpdateReason.LOG_IN ||
          reason === UpdateReason.SIGN_UP ||
          newLoggedInUser.profilePicture?.id !== profilePicture?.id
        ) {
          new Parse.Query<Parse.Object<Image>>("Image")
            .equalTo(ParseImage.COLUMNS.id, newLoggedInUser.profilePicture?.id)
            .first()
            .then((profilePictureResponse) => {
              if (profilePictureResponse) {
                setProfilePicture(new ParseImage(profilePictureResponse));
              }
            });
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
    ]
  );

  const saveLoggedInUserUpdates = async () => {
    if (
      initialized &&
      loggedInUser?.attributes &&
      attributes &&
      !loggedInUser.isEqual(ParseUser.fromAttributes(attributes))
    ) {
      setLoggedInUser(await loggedInUser.update(updateLoggedInUser));
      setAttributes({ ...loggedInUser.attributes });
    }
  };

  useInterval(saveLoggedInUserUpdates, 5000);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    if (loggedInUser) {
      updateLoggedInUser(loggedInUser, UpdateReason.LOG_IN);
    }
  }, [loggedInUser, updateLoggedInUser, initialized]);

  const value = {
    loggedInUser,
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
