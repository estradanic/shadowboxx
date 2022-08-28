import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Theme, ThemeProvider, createTheme } from "@material-ui/core/styles";
import DiscFullIcon from "@material-ui/icons/DiscFull";
import Parse from "parse";
import { useNotificationsContext, useUserContext } from "../contexts";
import {
  ActionDialogContextProvider,
  DefaultLayout,
  SnackbarProvider,
} from "../components";
import { Strings } from "../resources";
import routes from "./routes";
declare const globalThis: any;

Parse.serverURL = globalThis.__env__?.PARSE_HOST_URL;
Parse.initialize(
  globalThis.__env__?.PARSE_APPLICATION_ID,
  globalThis.__env__?.PARSE_JAVASCRIPT_KEY
);

// @ts-ignore: TODO remove this comment when the types are actually correct again
Parse.enableLocalDatastore(false);

const App = () => {
  const { getLoggedInUser, isUserLoggedIn } = useUserContext();
  const { addNotification } = useNotificationsContext();

  const darkTheme = (lightTheme: Theme) =>
    createTheme(
      isUserLoggedIn && getLoggedInUser()?.isDarkThemeEnabled
        ? {
            palette: {
              primary: {
                main: "#003F6F",
                dark: "#003156",
                contrastText: "#FFFFFF",
                light: "#01579B",
              },
              secondary: {
                main: "#A01E1E",
                dark: "#601212",
                light: "#B22222",
                contrastText: "#FFFFFF",
              },
              error: {
                main: "#A01E1E",
                dark: "#601212",
                light: "#B22222",
                contrastText: "#FFFFFF",
              },
              success: {
                main: "#209461",
                dark: "#166743",
                light: "#24A56C",
                contrastText: "#FFFFFF",
              },
              info: {
                main: "#01467C",
                dark: "#003156",
                contrastText: "#FFFFFF",
                light: "#01579B",
              },
              warning: {
                main: "#E17E00",
                dark: "#874B00",
                contrastText: "#FFFFFF",
                light: "#FB8C00",
              },
              divider: "#EEEEEE",
              background: {
                default: "#00182B",
                paper: "#0F1111",
              },
              text: {
                primary: "#FFFFFF",
                secondary: "#000000",
                disabled: "#DDDDDD",
                hint: "#DDDDDD",
              },
              grey: {
                50: "#111111",
              },
            },
          }
        : { ...lightTheme }
    );

  useEffect(() => {
    navigator.serviceWorker.register(
      `service-worker.js?version=${globalThis.__env__.SERVICE_WORKER_VERSION_NUMBER}`,
      { scope: "/" }
    );
    if (window.location.host.match(/^www\./) !== null) {
      window.location.host = window.location.host.substring(4);
    }
    navigator.storage.persisted().then((initialIsPersisted) => {
      if (!initialIsPersisted) {
        navigator.storage
          .persist()
          .then((isPersisted) =>
            console.log(
              "Storage ",
              isPersisted ? "persisted!" : "not persisted..."
            )
          );
      } else {
        console.log("Storage persisted!");
      }
    });
    navigator.storage.estimate().then((estimate) => {
      if (
        estimate &&
        estimate.quota !== undefined &&
        estimate.usage !== undefined
      ) {
        const percent = ((estimate.usage / estimate.quota) * 100).toFixed(2);
        console.log("Percent of storage used:", percent + "%");
        console.log("Storage left:", estimate.quota / 1000000, "Megabytes");
        if (estimate.quota - estimate.usage < 500000000) {
          addNotification({
            title: Strings.notEnoughSpace(),
            detail: Strings.limitedOffline(),
            icon: <DiscFullIcon />,
          });
          navigator.serviceWorker.ready.then((registration) => {
            registration.active?.postMessage({ useCache: false });
          });
        }
      }
    });
  }, [addNotification]);

  return (
    <ThemeProvider theme={darkTheme}>
      <ActionDialogContextProvider>
        <SnackbarProvider>
          <Suspense
            fallback={
              <div
                style={{
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "#1B71B5",
                  paddingTop: "calc(50vh - 40px)",
                  paddingLeft: "calc(50vw - 40px)",
                }}
              >
                <CircularProgress style={{ color: "#C14E4E" }} />
              </div>
            }
          >
            <Routes>
              {Object.values(routes).map((route) => (
                <Route
                  key={route.viewName}
                  element={
                    <DefaultLayout viewId={route.viewId}>
                      <route.View />
                    </DefaultLayout>
                  }
                  path={route.path}
                />
              ))}
            </Routes>
          </Suspense>
        </SnackbarProvider>
      </ActionDialogContextProvider>
    </ThemeProvider>
  );
};

export default App;
