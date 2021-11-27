import React from "react";
import { ListItem, ButtonBaseProps } from "@material-ui/core";
import { useHistory } from "react-router-dom";

/**
 * Interface defining props for ListItemLink
 */
export interface ListItemLinkProps extends ButtonBaseProps {
  to: string;
}

/**
 * Component used in a list to link to other paths within the app
 */
const ListItemLink = ({
  to,
  children,
  onClick: piOnClick,
}: ListItemLinkProps) => {
  const history = useHistory();

  const onClick = (event: any) => {
    piOnClick?.(event);
    history.push(to);
  };

  return (
    <ListItem button onClick={onClick}>
      {children}
    </ListItem>
  );
};

export default ListItemLink;
