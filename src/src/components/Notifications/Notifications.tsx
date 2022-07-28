import React, { ForwardedRef, forwardRef, useState } from "react";
import {
  Badge,
  Collapse,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core";
import {
  ArrowDropDown,
  ArrowDropUp,
  Close,
  Notifications as NotificationsIcon,
} from "@material-ui/icons";
import cx from "classnames";
import {
  useNotificationsContext,
  Notification as NotificationProps,
} from "../../contexts";
import { Strings } from "../../resources";
import { elide } from "../../utils";
import Tooltip from "../Tooltip/Tooltip";

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    color: theme.palette.primary.contrastText,
  },
  notEmpty: {
    color: theme.palette.warning.main,
  },
  icon: {
    marginBottom: theme.spacing(0.25),
  },
  menuItem: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  menuItemIcon: {
    "&& *": {
      color: theme.palette.primary.contrastText,
    },
  },
  close: {
    color: theme.palette.error.main,
    "&:hover, &:focus, &:active": {
      color: theme.palette.error.dark,
    },
  },
  detail: {
    padding: theme.spacing(0, 2),
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  endIcons: {
    marginLeft: "auto",
  },
}));

/** Interface defining props for Notifications */
interface NotificationsProps {
  /** Class to be passed through to the notification bell IconButton */
  className?: string;
}

/** Component to display notifications for the app */
const Notifications = ({ className }: NotificationsProps) => {
  const classes = useStyles();
  const { notifications } = useNotificationsContext();
  const empty = !notifications.length;
  const [anchorEl, setAnchorEl] = useState<Element>();

  return (
    <>
      <IconButton
        className={className}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Badge
          overlap="rectangular"
          badgeContent={notifications.length}
          color="error"
        >
          <NotificationsIcon
            className={cx(
              classes.icon,
              empty ? classes.text : classes.notEmpty
            )}
          />
        </Badge>
      </IconButton>
      <Menu
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        getContentAnchorEl={null}
        classes={{ paper: classes.menuItem }}
        elevation={0}
        keepMounted
        onClose={() => setAnchorEl(undefined)}
        anchorEl={anchorEl}
        open={!!anchorEl}
      >
        {notifications.length ? (
          notifications.map((notification) => (
            <Notification key={notification.id} {...notification} />
          ))
        ) : (
          <MenuItem className={classes.menuItem}>
            <Typography>{Strings.noNotifications()}</Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export const Notification = forwardRef(
  (
    { id, title, icon, detail, groupName, remove }: NotificationProps,
    ref: ForwardedRef<any>
  ) => {
    const classes = useStyles();
    const [open, setOpen] = useState<boolean>(false);
    const toggleOpen = () => {
      setOpen((prev) => !prev);
    };

    return (
      <>
        <MenuItem onClick={toggleOpen} ref={ref} className={classes.menuItem}>
          <ListItemIcon className={classes.menuItemIcon}>
            {icon ?? <NotificationsIcon />}
          </ListItemIcon>
          <Tooltip title={title}>
            <Typography>{elide(title, 20, 0)}</Typography>
          </Tooltip>
          <IconButton className={classes.endIcons}>
            {open ? (
              <ArrowDropUp className={classes.text} />
            ) : (
              <ArrowDropDown className={classes.text} />
            )}
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              remove();
            }}
          >
            <Close className={classes.close} />
          </IconButton>
        </MenuItem>
        <Collapse className={classes.detail} in={open}>
          <Typography>{detail ?? title}</Typography>
        </Collapse>
      </>
    );
  }
);

export default Notifications;
