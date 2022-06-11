import React from "react";
import { ListItem, ButtonBaseProps } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";

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
  const history = useHistory();
  const location = useLocation();
  const state = saveHistory
    ? {
        previousLocation: location,
      }
    : undefined;

  const onClick = (event: any) => {
    piOnClick?.(event);
    history.push(to, state);
  };

  return (
    <ListItem button onClick={onClick}>
      {children}
    </ListItem>
  );
};

export default ListItemLink;
