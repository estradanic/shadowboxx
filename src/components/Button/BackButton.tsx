import React from "react";
import {Button, ButtonProps} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import Strings from "../../resources/Strings";
import {ArrowBack} from "@material-ui/icons";
import {useRoutes} from "../../app/routes";
import {useNavigationContext} from "../../app/NavigationContext";

interface BackButtonProps
  extends Omit<ButtonProps, "onClick" | "children" | "startIcon"> {}

const BackButton = (props: BackButtonProps) => {
  const history = useHistory();
  const {getRoutePath} = useRoutes();
  const {routeHistory, routeParams, setRouteHistory} = useNavigationContext();

  const onClick = () => {
    const newRouteHistory = [...routeHistory];
    newRouteHistory.shift();
    setRouteHistory(newRouteHistory);
    history.push(getRoutePath(newRouteHistory[0], routeParams));
  };

  return (
    <Button startIcon={<ArrowBack />} onClick={onClick} {...props}>
      {Strings.back()}
    </Button>
  );
};

export default BackButton;
