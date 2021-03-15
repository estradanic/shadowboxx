import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
import {Link as MatLink, LinkProps as MatLinkProps} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";

export interface LinkProps
  extends Omit<MatLinkProps, "href">,
    Pick<RouterLinkProps, "to" | "replace"> {}

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    textDecoration: "none",
    color: "inherit",
  },
}));

const Link = ({children, to, replace, ...rest}: LinkProps) => {
  const classes = useStyles();
  return (
    <RouterLink className={classes.link} to={to} replace={replace}>
      <MatLink className={classes.link} component="span" href="#" {...rest}>
        {children}
      </MatLink>
    </RouterLink>
  );
};

export default Link;
