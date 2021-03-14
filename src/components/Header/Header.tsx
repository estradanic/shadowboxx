import React from "react";
import {AppBar, AppBarProps, Toolbar} from "@material-ui/core";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

export interface HeaderProps extends AppBarProps {
  viewId: string;
}

const Header = ({viewId, ...rest}: HeaderProps) => {
  return (
    <header>
      <AppBar {...rest}>
        <Toolbar>
          <Breadcrumbs viewId={viewId} />
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header;
