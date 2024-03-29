import React, { ForwardedRef, useCallback, useMemo, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import CalendarIcon from "@material-ui/icons/DateRange";
import Icon, { IconProps } from "@material-ui/core/Icon";
import classNames from "classnames";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { DateTime } from "luxon";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { forwardRef } from "react";
import { useActionDialogContext } from "../../Dialog/ActionDialog";
import TextField from "../../Field/TextField";
import useRefState from "../../../hooks/useRefState";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "100%",
    border: `2px solid ${theme.palette.primary.contrastText}`,
    display: "flex",
    "& > svg": {
      margin: "auto",
    },
  },
}));

export interface DateImageDecorationProps
  extends Omit<
    ImageDecorationProps<IconProps>,
    "Component" | "description" | "position" | "ComponentProps" | "onClick"
  > {
  /** Which position of the image to render the decoration */
  position?: ImageDecorationProps<IconProps>["position"];
  /** Props to pass down to the icon */
  IconProps?: IconProps;
  /** The initial state of the date */
  initialDate: Date;
  /** Callback fired when the date is confirmed */
  onConfirm: (date: Date) => void | Promise<void>;
}

const DateImageDecorationIcon = forwardRef(
  (props: IconProps, ref: ForwardedRef<any>) => (
    <Icon {...props} ref={ref}>
      <CalendarIcon />
    </Icon>
  )
);

/** Image decoration component to add/edit dates */
const DateImageDecoration = ({
  position = "topRight",
  className: userClassName,
  IconProps = {},
  initialDate: piInitialDate = new Date(),
  onConfirm,
  ...rest
}: DateImageDecorationProps) => {
  const classes = useStyles();
  const { openPrompt } = useActionDialogContext();
  const datePortalNode = useMemo(() => createHtmlPortalNode(), []);
  const [initialDate, setInitialDate] = useState(piInitialDate);
  const [dateRef, date, setDate] = useRefState(
    DateTime.fromJSDate(initialDate)
  );

  const handleConfirm = useCallback(async () => {
    await onConfirm(dateRef.current.toJSDate());
    setInitialDate(dateRef.current.toJSDate());
  }, [onConfirm, dateRef]);

  const handleCancel = useCallback(async () => {
    setDate(DateTime.fromJSDate(initialDate));
  }, [initialDate, setDate]);

  return (
    <>
      <InPortal node={datePortalNode}>
        <TextField
          value={date.toISO({ includeOffset: false })}
          onChange={(e) => setDate(DateTime.fromISO(e.target.value))}
          label={Strings.label.dateTaken}
          type="datetime-local"
        />
      </InPortal>
      <ImageDecoration<IconProps>
        onClick={() => {
          openPrompt(datePortalNode, handleConfirm, handleCancel, {
            title: Strings.action.addOrEditDate,
            confirmButtonColor: "success",
          });
        }}
        position={position}
        Component={DateImageDecorationIcon}
        description={Strings.action.dateImage}
        ComponentProps={{
          fontSize: "large",
          ...IconProps,
        }}
        className={classNames(classes.root, userClassName)}
        {...rest}
      />
    </>
  );
};

export default DateImageDecoration;
