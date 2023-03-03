import React from "react";
import MuiFab, { FabProps as MuiFabProps } from "@material-ui/core/Fab";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import useHideOnScroll from "../../hooks/useHideOnScroll";
import { VariableColor } from "../../types";

type UseStylesProps = {
  color: VariableColor;
};

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    backgroundColor: ({ color }: UseStylesProps) => theme.palette[color].main,
    color: ({ color }: UseStylesProps) => theme.palette[color].contrastText,
    position: "absolute",
    right: theme.spacing(4),
    "&:hover, &:focus, &:active": {
      backgroundColor: ({ color }: UseStylesProps) => theme.palette[color].dark,
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

export interface FabProps extends Omit<MuiFabProps, "color"> {
  color?: VariableColor;
}

const Fab = ({ children, className, color = "success", ...rest }: FabProps) => {
  const visible = useHideOnScroll();
  const classes = useStyles({ color });

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
