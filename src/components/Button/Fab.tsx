import React from "react";
import MuiFab, { FabProps as MuiFabProps } from "@material-ui/core/Fab";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import { useHideOnScroll } from "../../hooks";

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    position: "absolute",
    right: theme.spacing(4),
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.success.dark,
    },
    transition: theme.transitions.create("bottom"),
    zIndex: theme.zIndex.speedDial,
  },
  fabVisible: {
    bottom: theme.spacing(7),
  },
  fabHidden: {
    bottom: theme.spacing(-10),
  },
}));

export interface FabProps extends MuiFabProps {}

const Fab = ({ children, className, ...rest }: FabProps) => {
  const visible = useHideOnScroll();
  const classes = useStyles();

  return (
    <MuiFab
      className={classNames(classes.fab, className, {
        [classes.fabVisible]: visible,
        [classes.fabHidden]: !visible,
      })}
      {...rest}
    >
      {children}
    </MuiFab>
  );
};

export default Fab;
