import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  useLocation,
} from "react-router-dom";
import MuiLink, { LinkProps as MuiLinkProps } from "@material-ui/core/Link";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { parsePath } from "history";

/**
 * Interface defining props for Link
 */
export interface LinkProps
  extends Omit<MuiLinkProps, "href">,
    Pick<RouterLinkProps, "replace"> {
  saveHistory?: boolean;
  to: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    textDecoration: "none",
    color: "inherit",
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
  },
}));

/**
 * Component combining the navigation functionality of the React Router Link
 * and the styling of the Material UI Link
 */
const Link = ({
  children,
  to: userTo,
  replace,
  saveHistory = true,
  ...rest
}: LinkProps) => {
  const classes = useStyles();
  const location = useLocation();
  const to = saveHistory
    ? {
        ...parsePath(userTo),
        state: {
          previousLocation: location,
        },
      }
    : userTo;

  return (
    <RouterLink className={classes.link} to={to} replace={replace}>
      <MuiLink
        variant="h6"
        className={classes.link}
        component="span"
        href="#"
        {...rest}
      >
        {children}
      </MuiLink>
    </RouterLink>
  );
};

export default Link;
