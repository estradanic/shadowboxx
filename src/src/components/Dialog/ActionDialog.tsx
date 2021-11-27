import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Strings from "../../resources/Strings";

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
  handleConfirm?: () => void;
  /** Function to run when the close button is clicked */
  handleClose?: () => void;
  /** What type of dialog this is, similar to builtin javascript alert, confirm, and prompt */
  type: "alert" | "confirm" | "prompt";
  /** Field or fields to be returned as the prompt value */
  promptField?: React.ReactNode;
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
    handleConfirm?: () => void,
    handleCancel?: () => void,
    actionDialogProps?: ActionDialogHookProps
  ) => void;
  /** Opens a prompt dialog */
  openPrompt: (
    fields: ReactNode,
    handleConfirm?: () => void,
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
  const [fields, setFields] = useState<ReactNode>(<></>);
  const [handleConfirm, setHandleConfirm] = useState(() => () => {});
  const [handleCancel, setHandleCancel] = useState(() => () => {});
  const [handleClose, setHandleClose] = useState(() => () => {});
  const [
    actionDialogProps,
    setActionDialogProps,
  ] = useState<ActionDialogHookProps>({});

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
      setHandleConfirm(() => () => {
        setOpen(false);
        piHandleConfirm?.();
      });
      setHandleCancel(() => () => {
        setOpen(false);
        piHandleCancel?.();
      });
      setActionDialogProps(piActionDialogProps);
      setOpen(true);
    },
    openPrompt: (
      piFields,
      piHandleConfirm,
      piHandleCancel,
      piActionDialogProps = {}
    ) => {
      setType("prompt");
      setFields(piFields);
      setHandleConfirm(() => () => {
        setOpen(false);
        piHandleConfirm?.();
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
          promptField={fields}
          type={type}
          {...actionDialogProps}
        />
        {children}
      </>
    </ActionDialogContext.Provider>
  );
};

/** Alias to useContext(ActionDialogContext) */
export const useActionDialogContext = () => useContext(ActionDialogContext);

/** Component to replace the builtin javascript alert, confirm, and prompt functionality */
const ActionDialog = ({
  title,
  message,
  handleCancel,
  handleConfirm,
  handleClose,
  type,
  promptField,
  confirmButtonColor = "default",
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
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        {promptField}
      </DialogContent>
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
