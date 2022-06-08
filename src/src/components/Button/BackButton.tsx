import React from "react";
import { Button, ButtonProps } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Strings from "../../resources/Strings";
import { ArrowBack } from "@material-ui/icons";
import { useRoutes } from "../../app/routes";
import { useNavigationContext } from "../../app/NavigationContext";

/** Interface defining props for BackButton */
interface BackButtonProps
  extends Omit<ButtonProps, "onClick" | "children" | "startIcon"> {
  placement?: "header" | "body";
}

/** Component to move backwards one route in history */
const BackButton = ({ placement = "header", ...rest }: BackButtonProps) => {
  const history = useHistory();
  const { getRoutePath } = useRoutes();
  const { routeHistory, routeParams, setRouteHistory } = useNavigationContext();

  const onClick = () => {
    const newRouteHistory = [...routeHistory];
    newRouteHistory.shift();
    setRouteHistory(newRouteHistory);
    history.push(getRoutePath(newRouteHistory[0], routeParams));
  };

  const startIcon = placement === "header" ? <ArrowBack /> : undefined;
  const text = placement === "header" ? Strings.back() : Strings.goBack();

  return (
    <Button startIcon={startIcon} onClick={onClick} {...rest}>
      {text}
    </Button>
  );
};

export default BackButton;
