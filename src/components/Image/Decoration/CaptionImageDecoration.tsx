import React, { ForwardedRef, useCallback, useMemo } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import NotesIcon from "@material-ui/icons/Notes";
import Icon, { IconProps } from "@material-ui/core/Icon";
import classNames from "classnames";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { forwardRef } from "react";
import { useActionDialogContext } from "../../Dialog/ActionDialog";
import { TextField } from "../../Field";
import useRefState from "../../../hooks/useRefState";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "100%",
    border: `2px solid ${theme.palette.primary.contrastText}`,
  },
}));

export interface CaptionImageDecorationProps
  extends Omit<
    ImageDecorationProps<IconProps>,
    "Component" | "description" | "corner" | "ComponentProps" | "onClick"
  > {
  corner?: ImageDecorationProps<IconProps>["corner"];
  IconProps?: IconProps;
  initialCaption: string;
  onConfirm: (caption: string) => void;
}

const CaptionImageDecorationIcon = forwardRef(
  (props: IconProps, ref: ForwardedRef<any>) => (
    <Icon {...props} ref={ref}>
      <NotesIcon />
    </Icon>
  )
);

/** Image decoration component to add/edit captions */
const CaptionImageDecoration = ({
  corner = "bottomLeft",
  className: userClassName,
  IconProps = {},
  initialCaption,
  onConfirm,
  ...rest
}: CaptionImageDecorationProps) => {
  const classes = useStyles();
  const { openPrompt } = useActionDialogContext();
  const captionPortalNode = useMemo(() => createHtmlPortalNode(), []);
  const [captionRef, caption, setCaption] = useRefState(initialCaption);

  const handleConfirm = useCallback(async () => {
    onConfirm(captionRef.current);
  }, [onConfirm, captionRef]);

  const handleCancel = useCallback(async () => {
    setCaption(initialCaption);
  }, [initialCaption, setCaption]);

  return (
    <>
      <InPortal node={captionPortalNode}>
        <TextField
          onChange={(e) => setCaption(e.target.value)}
          label={Strings.label.caption}
          value={caption ?? ""}
        />
      </InPortal>
      <ImageDecoration<IconProps>
        onClick={() => {
          openPrompt(captionPortalNode, handleConfirm, handleCancel, {
            title: Strings.action.addOrEditCaption,
            confirmButtonColor: "success",
          });
        }}
        corner={corner}
        Component={CaptionImageDecorationIcon}
        description={Strings.action.captionImage}
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

export default CaptionImageDecoration;
