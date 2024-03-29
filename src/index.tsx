import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import {
  MuiThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "./components";
import { lightThemeSettings } from "./app/theme";
import App from "./app/App";
import { NetworkDetectionContextProvider } from "./contexts/NetworkDetectionContext";
import { UserContextProvider } from "./contexts/UserContext";
import { NotificationsContextProvider } from "./contexts/NotificationsContext";
import { JobContextProvider } from "./contexts/JobContext";

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
  <StrictMode>
    <MuiThemeProvider theme={theme}>
      <NetworkDetectionContextProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <UserContextProvider>
              <SnackbarProvider>
                <NotificationsContextProvider>
                  <JobContextProvider>
                    <App />
                  </JobContextProvider>
                </NotificationsContextProvider>
              </SnackbarProvider>
            </UserContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </NetworkDetectionContextProvider>
    </MuiThemeProvider>
  </StrictMode>,
  document.getElementById("root")
);
