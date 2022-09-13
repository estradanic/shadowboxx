import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import {
  MuiThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { QueryClient } from "@tanstack/react-query";
import { PersistedClient, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  UserContextProvider,
  NotificationsContextProvider,
  GlobalLoadingContextProvider,
  NetworkDetectionContextProvider,
  ScrollPositionContextProvider,
} from "./contexts";
import { IdbKeyvalStorage, ParseAlbum, ParseImage, ParseObject, ParsePointer, ParseUser } from "./classes";
import App from "./app/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity, // never expire the cache
    },
  },
});

const initializeParseObject = (data: any): any => {
  if (data.pages) {
    data.pages = data.pages.map((object) => initializeParseObject(object));
    return data;
  }
  if (data.map && typeof data.map === "function") {
    return data.map((object) => initializeParseObject(object));
  }
  if (data._album) {
    return new ParseAlbum(data._album);
  }
  if (data._image) {
    return new ParseImage(data._image);
  }
  if (data._user) {
    return new ParseUser(data._user);
  }
  if (data._pointer) {
    return new ParsePointer(data._pointer);
  }
  if (data._object) {
    return new ParseObject(data._object);
  }
  return data;
}

const asyncStoragePersister = createAsyncStoragePersister({
  storage: new IdbKeyvalStorage(),
  deserialize: (cachedString) => {
    const persistedClient: PersistedClient = JSON.parse(cachedString);
    persistedClient.clientState.queries = persistedClient.clientState.queries.map((query) => {
      query.state.data = initializeParseObject(query.state.data);
      return query;
    });
    return persistedClient;
  },
});

const theme = createMuiTheme({
  overrides: {
    MuiFilledInput: {
      underline: {
        "&::before,&:hover::before": {
          borderBottom: "none",
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#01579B",
      dark: "#01467C",
      contrastText: "#FFFFFF",
      light: "#1B71B5",
    },
    secondary: {
      main: "#B22222",
      dark: "#A01E1E",
      light: "#C14E4E",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#B22222",
      dark: "#A01E1E",
      light: "#C14E4E",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#24A56C",
      dark: "#209461",
      light: "#4CA980",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#01579B",
      dark: "#01467C",
      contrastText: "#FFFFFF",
      light: "#1B71B5",
    },
    warning: {
      main: "#FB8C00",
      dark: "#E17E00",
      contrastText: "#FFFFFF",
      light: "#E79732",
    },
    divider: "#111111",
    background: {
      default: "#1B71B5",
      paper: "#FFFFFF",
    },
    grey: {
      50: "#EEEEEE",
    },
    text: {
      primary: "#000000",
      secondary: "#FFFFFF",
      disabled: "#222222",
      hint: "#222222",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
      <NetworkDetectionContextProvider>
        <GlobalLoadingContextProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}
          >
            <NotificationsContextProvider>
              <BrowserRouter>
                <ScrollPositionContextProvider>
                  <UserContextProvider>
                    <App />
                  </UserContextProvider>
                </ScrollPositionContextProvider>
              </BrowserRouter>
            </NotificationsContextProvider>
          </PersistQueryClientProvider>
        </GlobalLoadingContextProvider>
      </NetworkDetectionContextProvider>
    </MuiThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
