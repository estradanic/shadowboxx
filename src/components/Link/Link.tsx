import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
import {Link as MatLink, LinkProps as MatLinkProps} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";

/**
 * Interface defining props for Link
 */
export interface LinkProps
  extends Omit<MatLinkProps, "href">,
    Pick<RouterLinkProps, "to" | "replace"> {}

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
 * @param param0
 * @returns
 */
const Link = ({children, to, replace, ...rest}: LinkProps) => {
  const classes = useStyles();
  return (
    <RouterLink className={classes.link} to={to} replace={replace}>
      <MatLink
        variant="h6"
        className={classes.link}
        component="span"
        href="#"
        {...rest}
      >
        {children}
      </MatLink>
    </RouterLink>
  );
};

export default Link;
