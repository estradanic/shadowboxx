import React, { createContext, useContext, useState } from "react";
import { ParseUser, UpdateLoggedInUser, UpdateReason } from "../types/User";
import { ParseImage } from "../types/Image";
import Parse from "parse";

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
  const [loggedInUser, setLoggedInUser] = useState<ParseUser | undefined>(
    Parse.User.current() as ParseUser
  );
  const [profilePicture, setProfilePicture] = useState<
    ParseImage | undefined
  >();

  const updateLoggedInUser = (
    newLoggedInUser: ParseUser,
    reason: UpdateReason
  ) => {
    if (reason === UpdateReason.LOG_OUT) {
      setLoggedInUser(undefined);
      setProfilePicture(undefined);
    } else if (
      !loggedInUser ||
      newLoggedInUser.objectId === loggedInUser.objectId
    ) {
      if (reason !== UpdateReason.UPDATE) {
        setLoggedInUser(newLoggedInUser);
      }
      if (
        reason !== UpdateReason.UPDATE ||
        newLoggedInUser.profilePicture?.objectId !==
          loggedInUser?.profilePicture?.objectId
      ) {
        new Parse.Query<ParseImage>("Image")
          .equalTo("objectId", newLoggedInUser.profilePicture?.objectId)
          .first()
          .then((profilePictureResponse) => {
            setProfilePicture(profilePictureResponse);
          });
      }
    }
  };

  const value = {
    loggedInUser,
    profilePicture,
    updateLoggedInUser,
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
