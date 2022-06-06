import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ParseUser, {
  UpdateLoggedInUser,
  UpdateReason,
  User,
} from "../types/User";
import ParseImage, { Image } from "../types/Image";
import Parse from "parse";
import Strings from "../resources/Strings";
import useInterval from "use-interval";

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
  const [initialized, setInitialized] = useState<boolean>(false);

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
        if (reason === UpdateReason.LOG_IN) {
          newLoggedInUser.fetch().then((userResponse) => {
            if (userResponse) {
              setLoggedInUser(userResponse);
            } else {
              console.error(Strings.couldNotGetUserInfo());
            }
          });
        }
        if (
          reason === UpdateReason.LOG_IN ||
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
    [setLoggedInUser, setProfilePicture, loggedInUser, profilePicture?.id]
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
    if (initialized) {
      return;
    }
    setInitialized(true);
    if (loggedInUser) {
      updateLoggedInUser(loggedInUser, UpdateReason.LOG_IN);
    }
  }, [loggedInUser, updateLoggedInUser, initialized, setInitialized]);

  const value = {
    loggedInUser,
    profilePicture,
    updateLoggedInUser,
    saveLoggedInUserUpdates,
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
