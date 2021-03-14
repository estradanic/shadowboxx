import React from "react";
import {BrowserRouter as Router, Switch} from "react-router-dom";
import ViewWrapper from "./ViewWrapper";
import {routes} from "./routes";

const App = () => (
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

export default App;
