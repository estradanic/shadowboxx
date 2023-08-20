import React from "react";
import Button, { ButtonProps } from "@material-ui/core/Button";
import { useLocation, Location } from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Strings } from "../../resources";
import useNavigate from "../../hooks/useNavigate";

/** Interface defining props for BackButton */
interface BackButtonProps
  extends Omit<ButtonProps, "onClick" | "children" | "startIcon"> {
  /** Whether the button placement is in the header or body of the content (for styling) */
  placement?: "header" | "body";
}

/** Component to move backwards one route in history */
const BackButton = ({ placement = "header", ...rest }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation() as { state: { previousLocation: Location } };

  const startIcon = placement === "header" ? <ArrowBackIcon /> : undefined;
  const text =
    placement === "header" ? Strings.action.back : Strings.action.goBack;

  return (
    <Button
      startIcon={startIcon}
      onClick={() => navigate(location.state?.previousLocation)}
      {...rest}
    >
      {text}
    </Button>
  );
};

export default BackButton;
