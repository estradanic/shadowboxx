import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  Tooltip as MatTooltip,
  TooltipProps as MatTooltipProps,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    fontSize: "small",
  },
  arrow: {
    color: theme.palette.text.primary,
  },
}));

/** Interface defining props for the Tooltip component */
export interface TooltipProps extends Omit<MatTooltipProps, "arrow"> {}

/** Component to display helpful information on hover */
const Tooltip = ({ children, ...rest }: TooltipProps) => {
  const classes = useStyles();
  return (
    <MatTooltip {...rest} arrow classes={classes}>
      {children}
    </MatTooltip>
  );
};

export default Tooltip;
