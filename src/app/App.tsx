import React from "react";
import {BrowserRouter as Router, Switch} from "react-router-dom";
import ViewWrapper from "./ViewWrapper";
import {useRoutes} from "./routes";

const App = () => {
  const {routes} = useRoutes();

  return (
    <Router>
      <div>
        <Switch>
          {Object.keys(routes).map((routeKey) => (
            <ViewWrapper key={routeKey} {...routes[routeKey]} />
          ))}
        </Switch>
      </div>
    </Router>
  );
};

export default App;
