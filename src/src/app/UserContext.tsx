import React, { createContext, useContext, useMemo } from "react";
import { ParseUser } from "../types/User";
import { useParseQuery } from "@parse/react";
import { useParseQueryOptions } from "../constants/useParseQueryOptions";
import { ParseImage } from "../types/Image";

/**
 * Interface defining the return value of the UserContext
 */
interface UserContextValue {
  /** Currently logged in user */
  loggedInUser?: ParseUser;
  /** Profile picture of the currently logged in user */
  profilePicture?: ParseImage;
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
  const { results: loggedInUserResults } = useParseQuery(
    new Parse.Query<ParseUser>("User").equalTo(
      "objectId",
      Parse.User.current()?.get("objectId")
    ),
    useParseQueryOptions
  );

  const loggedInUser = useMemo(() => loggedInUserResults?.[0], [
    loggedInUserResults,
  ]);

  const { results: profilePictureResults } = useParseQuery(
    new Parse.Query<ParseImage>("Image").equalTo(
      "objectId",
      loggedInUser?.profilePicture?.objectId
    ),
    useParseQueryOptions
  );

  const profilePicture = useMemo(() => profilePictureResults?.[0], [
    profilePictureResults,
  ]);

  const value = {
    loggedInUser,
    profilePicture,
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
