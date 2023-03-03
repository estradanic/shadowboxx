import React from "react";
import ListItem from "@material-ui/core/ListItem";
import { ButtonBaseProps } from "@material-ui/core/ButtonBase";
import { useLocation } from "react-router-dom";
import useNavigate from "../../hooks/useNavigate";

/**
 * Interface defining props for ListItemLink
 */
export interface ListItemLinkProps extends ButtonBaseProps {
  to: string;
  saveHistory?: boolean;
}

/**
 * Component used in a list to link to other paths within the app
 */
const ListItemLink = ({
  to,
  children,
  onClick: piOnClick,
  saveHistory = true,
}: ListItemLinkProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const onClick = (event: any) => {
    piOnClick?.(event);
    navigate(to, saveHistory ? location : undefined);
  };

  return (
    <ListItem button onClick={onClick}>
      {children}
    </ListItem>
  );
};

export default ListItemLink;
