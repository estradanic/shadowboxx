import React, { forwardRef } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import MuiTooltip, {
  TooltipProps as MuiTooltipProps,
} from "@material-ui/core/Tooltip";

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
export interface TooltipProps extends Omit<MuiTooltipProps, "arrow"> {}

/** Component to display helpful information on hover */
const Tooltip = forwardRef(({ children, ...rest }: TooltipProps, ref) => {
  const classes = useStyles();
  return (
    <MuiTooltip {...rest} arrow classes={classes} ref={ref}>
      {children}
    </MuiTooltip>
  );
});

export default Tooltip;
