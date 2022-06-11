import React from "react";
import { Button, ButtonProps } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { ArrowBack } from "@material-ui/icons";
import { Strings } from "../../resources";

/** Interface defining props for BackButton */
interface BackButtonProps
  extends Omit<ButtonProps, "onClick" | "children" | "startIcon"> {
  placement?: "header" | "body";
}

/** Component to move backwards one route in history */
const BackButton = ({ placement = "header", ...rest }: BackButtonProps) => {
  const history = useHistory();

  const startIcon = placement === "header" ? <ArrowBack /> : undefined;
  const text = placement === "header" ? Strings.back() : Strings.goBack();

  return (
    <Button startIcon={startIcon} onClick={history.goBack} {...rest}>
      {text}
    </Button>
  );
};

export default BackButton;
