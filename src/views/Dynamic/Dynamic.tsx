import React from "react";
import ViewProps from "../ViewProps";
import {useNavigationContextEffect} from "../../app/NavigationContext";

interface DynamicParams {
  someParam: string;
}

const Dynamic = ({match}: ViewProps<DynamicParams>) => {
  useNavigationContextEffect({
    routeParams: {AboutDynamic: {someParam: match.params.someParam}},
  });

  return (
    <div>
      <h1>Dynamic</h1>
      <h4>{match.params.someParam}</h4>
    </div>
  );
};

export default Dynamic;
