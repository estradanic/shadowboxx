import React, {
  createContext,
  memo,
  ReactNode,
  useContext,
  useState,
} from "react";
import Button from "@material-ui/core/Button";
import Dialog, { DialogProps } from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import { HtmlPortalNode, OutPortal } from "react-reverse-portal";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Strings } from "../../resources";

const useStyles = makeStyles((theme: Theme) => ({
  confirmButtonError: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.error.dark,
    },
  },
  confirmButtonWarning: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.warning.dark,
    },
  },
  confirmButtonSuccess: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.success.dark,
    },
  },
  title: {
    textAlign: "center",
  },
  titleText: {
    fontSize: "x-large",
  },
}));

/** Interface defining props for ActionDialog */
export interface ActionDialogProps extends DialogProps {
  /** Message about the dialog */
  message: string;
  /** Function to run when the cancel button is clicked */
  handleCancel?: () => void;
  /** Function to run when the confirm button is clicked */
  handleConfirm?: () => Promise<void>;
  /** Function to run when the close button is clicked */
  handleClose?: () => void;
  /** What type of dialog this is, similar to builtin javascript alert, confirm, and prompt */
  type: "alert" | "confirm" | "prompt";
  /** Color of the confirm button */
  confirmButtonColor?: "error" | "warning" | "success" | "default";
}

/** ActionDialogProps overridable by a function call from the context */
export type ActionDialogHookProps = Partial<
  Omit<
    ActionDialogProps,
    | "open"
    | "type"
    | "message"
    | "handleConfirm"
    | "handleCancel"
    | "handleClose"
    | "promptFields"
  >
>;

/** Interface defining the value of ActionDialogContextProvider */
interface ActionDialogContextValue {
  /** Opens an alert dialog */
  openAlert: (
    message: string,
    handleClose?: () => void,
    actionDialogProps?: ActionDialogHookProps
  ) => void;
  /** Opens a confirmation dialog */
  openConfirm: (
    message: string,
    handleConfirm?: () => Promise<void>,
    handleCancel?: () => void,
    actionDialogProps?: ActionDialogHookProps
  ) => void;
  /** Opens a prompt dialog */
  openPrompt: (
    fieldsPortalNode: HtmlPortalNode,
    handleConfirm?: () => Promise<void>,
    handleCancel?: () => void,
    actionDialogProps?: ActionDialogHookProps
  ) => void;
}

/** Context to manage general use ActionDialogs */
const ActionDialogContext = createContext<ActionDialogContextValue>({
  openAlert: () => {},
  openConfirm: () => {},
  openPrompt: () => {},
});

/** Interface defining props for the ActionDialogContextProvider */
interface ActionDialogContextProviderProps {
  /** Child node */
  children: ReactNode;
}

export const ActionDialogContextProvider = ({
  children,
}: ActionDialogContextProviderProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<ActionDialogProps["type"]>("alert");
  const [message, setMessage] = useState<string>("");
  const [fieldsPortalNode, setFieldsPortalNode] = useState<HtmlPortalNode>();
  const [handleConfirm, setHandleConfirm] = useState(() => async () => {});
  const [handleCancel, setHandleCancel] = useState(() => () => {});
  const [handleClose, setHandleClose] = useState(() => () => {});
  const [actionDialogProps, setActionDialogProps] =
    useState<ActionDialogHookProps>({});

  const value: ActionDialogContextValue = {
    openAlert: (piMessage, piHandleClose, piActionDialogProps = {}) => {
      setType("alert");
      setMessage(piMessage);
      setHandleClose(() => () => {
        setOpen(false);
        piHandleClose?.();
      });
      setActionDialogProps(piActionDialogProps);
      setOpen(true);
    },
    openConfirm: (
      piMessage,
      piHandleConfirm,
      piHandleCancel,
      piActionDialogProps = {}
    ) => {
      setType("confirm");
      setMessage(piMessage);
      setHandleConfirm(() => async () => {
        setOpen(false);
        await piHandleConfirm?.();
      });
      setHandleCancel(() => () => {
        setOpen(false);
        piHandleCancel?.();
      });
      setActionDialogProps(piActionDialogProps);
      setOpen(true);
    },
    openPrompt: (
      piFieldsPortalNode,
      piHandleConfirm,
      piHandleCancel,
      piActionDialogProps = {}
    ) => {
      setType("prompt");
      setFieldsPortalNode(piFieldsPortalNode);
      setHandleConfirm(() => async () => {
        setOpen(false);
        await piHandleConfirm?.();
      });
      setHandleCancel(() => () => {
        setOpen(false);
        piHandleCancel?.();
      });
      setActionDialogProps(piActionDialogProps);
      setOpen(true);
    },
  };

  return (
    <ActionDialogContext.Provider value={value}>
      <>
        <ActionDialog
          message={message}
          open={open}
          handleCancel={handleCancel}
          handleConfirm={handleConfirm}
          handleClose={handleClose}
          type={type}
          {...actionDialogProps}
        >
          {!!fieldsPortalNode && <OutPortal node={fieldsPortalNode} />}
        </ActionDialog>
        {children}
      </>
    </ActionDialogContext.Provider>
  );
};

/** Alias to useContext(ActionDialogContext) */
export const useActionDialogContext = () => useContext(ActionDialogContext);

interface ActionDialogContentProps
  extends Pick<ActionDialogProps, "message" | "type" | "children"> {}

// This is broken into a separate component and memoized to prevent rerenders
// when handleCancel, handleConfirm, and handleClose change.
const ActionDialogContent = memo(
  ({ message, type, children }: ActionDialogContentProps) => {
    return (
      <DialogContent>
        <DialogContentText color="textPrimary">{message}</DialogContentText>
        {type === "prompt" && children}
      </DialogContent>
    );
  }
);

/** Component to replace the builtin javascript alert, confirm, and prompt functionality */
const ActionDialog = ({
  title,
  message,
  handleCancel,
  handleConfirm,
  handleClose,
  type,
  confirmButtonColor = "default",
  children,
  ...rest
}: ActionDialogProps) => {
  const classes = useStyles();

  return (
    <Dialog {...rest}>
      <DialogTitle disableTypography className={classes.title}>
        <Typography className={classes.titleText} variant="overline">
          {title}
        </Typography>
      </DialogTitle>
      <ActionDialogContent message={message} type={type}>
        {children}
      </ActionDialogContent>
      <DialogActions>
        {type === "alert" ? (
          <Button onClick={handleClose}>{Strings.okay()}</Button>
        ) : (
          <>
            <Button onClick={handleCancel}>{Strings.cancel()}</Button>
            <Button
              className={
                confirmButtonColor === "error"
                  ? classes.confirmButtonError
                  : confirmButtonColor === "warning"
                  ? classes.confirmButtonWarning
                  : confirmButtonColor === "success"
                  ? classes.confirmButtonSuccess
                  : ""
              }
              onClick={handleConfirm}
            >
              {Strings.confirm()}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ActionDialog;
