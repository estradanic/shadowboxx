import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import {
  MuiThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  UserContextProvider,
  NotificationsContextProvider,
  NetworkDetectionContextProvider,
} from "./contexts";
import { SnackbarProvider } from "./components";
import { lightThemeSettings } from "./app/theme";
import App from "./app/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "always",
      refetchOnReconnect: true,
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

const theme = createMuiTheme(lightThemeSettings);

ReactDOM.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
      <NetworkDetectionContextProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <UserContextProvider>
              <SnackbarProvider>
                <NotificationsContextProvider>
                  <App />
                </NotificationsContextProvider>
              </SnackbarProvider>
            </UserContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </NetworkDetectionContextProvider>
    </MuiThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
