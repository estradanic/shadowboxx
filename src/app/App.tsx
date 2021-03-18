import React from "react";
import {BrowserRouter as Router, Switch} from "react-router-dom";
import ViewWrapper from "./RouteWrapper";
import {useRoutes} from "./routes";

const App = () => {
  const {routes} = useRoutes();

  return (
    <Router>
      <Switch>
        {Object.keys(routes).map((routeKey) => (
          <ViewWrapper key={routeKey} {...routes[routeKey]} />
        ))}
      </Switch>
    </Router>
  );
};

export default App;
