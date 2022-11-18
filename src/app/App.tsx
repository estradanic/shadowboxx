import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  Theme,
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createTheme,
} from "@material-ui/core/styles";
import DiscFullIcon from "@material-ui/icons/DiscFull";
import Parse from "parse";
import { useNotificationsContext, useUserContext } from "../contexts";
import { ActionDialogContextProvider, DefaultLayout } from "../components";
import { Strings } from "../resources";
import routes from "./routes";
import { darkThemeSettings } from "./theme";

Parse.serverURL = window.__env__?.PARSE_HOST_URL;
Parse.initialize(
  window.__env__?.PARSE_APPLICATION_ID,
  window.__env__?.PARSE_JAVASCRIPT_KEY
);
Parse.enableLocalDatastore(false);

const App = () => {
  const { getLoggedInUser, isUserLoggedIn } = useUserContext();
  const { addNotification } = useNotificationsContext();

  const darkTheme = (lightThemeSettings: Theme) =>
    createTheme(
      isUserLoggedIn && getLoggedInUser()?.isDarkThemeEnabled
        ? darkThemeSettings
        : lightThemeSettings
    );

  useEffect(() => {
    navigator?.serviceWorker?.register?.(
      `/service-worker.js?version=${window.__env__.SERVICE_WORKER_VERSION_NUMBER}`,
      { scope: "/" }
    );
    if (window.location.host.match(/^www\./) !== null) {
      window.location.host = window.location.host.substring(4);
    }
    navigator?.storage?.persisted?.()?.then?.((initialIsPersisted) => {
      if (!initialIsPersisted) {
        navigator.storage
          .persist?.()
          ?.then((isPersisted) =>
            console.log(
              "Storage ",
              isPersisted ? "persisted!" : "not persisted..."
            )
          );
      } else {
        console.log("Storage persisted!");
      }
    });
    navigator?.storage?.estimate?.()?.then?.((estimate) => {
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
          navigator?.serviceWorker?.ready?.then((registration) => {
            registration.active?.postMessage({ useCache: false });
          });
        }
      }
    });
  }, [addNotification]);

  return (
    <ThemeProvider theme={darkTheme}>
      <ActionDialogContextProvider>
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
      </ActionDialogContextProvider>
    </ThemeProvider>
  );
};

export default App;
