import React, {useState, createContext, useContext} from "react";

interface UserContextValue {
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext({
  loggedIn: false,
  setLoggedIn: (_: boolean | ((_: boolean) => boolean)) => {},
  username: "",
  setUsername: (_: string | ((_: string) => string)) => {},
  name: "",
  setName: (_: string | ((_: string) => string)) => {},
});

interface UserContextProviderProps {
  children: React.ReactNode;
}

export const UserContextProvider = ({children}: UserContextProviderProps) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [name, setName] = useState<string>("");

  const value: UserContextValue = {
    loggedIn,
    setLoggedIn,
    username,
    setUsername,
    name,
    setName,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
