import React, {
  ForwardedRef,
  useCallback,
  useMemo,
  forwardRef,
  useState,
} from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import NotesIcon from "@material-ui/icons/Notes";
import Icon, { IconProps } from "@material-ui/core/Icon";
import classNames from "classnames";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
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
    "Component" | "description" | "position" | "ComponentProps" | "onClick"
  > {
  /** Which position of the image to render the decoration */
  position?: ImageDecorationProps<IconProps>["position"];
  /** Props to pass down to the icon */
  IconProps?: IconProps;
  /** The initial state of the caption */
  initialCaption: string;
  /** Callback fired when the caption is confirmed */
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
  position = "bottomLeft",
  className: piClassName,
  IconProps = {},
  initialCaption: piInitialCaption = "",
  onConfirm,
  ...rest
}: CaptionImageDecorationProps) => {
  const classes = useStyles();
  const { openPrompt } = useActionDialogContext();
  const captionPortalNode = useMemo(() => createHtmlPortalNode(), []);
  const [initialCaption, setInitialCaption] = useState(piInitialCaption);
  const [captionRef, caption, setCaption] = useRefState(initialCaption);

  const handleConfirm = useCallback(async () => {
    onConfirm(captionRef.current);
    setInitialCaption(captionRef.current);
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
        position={position}
        Component={CaptionImageDecorationIcon}
        description={Strings.action.captionImage}
        ComponentProps={{
          fontSize: "large",
          ...IconProps,
        }}
        className={classNames(classes.root, piClassName)}
        {...rest}
      />
    </>
  );
};

export default CaptionImageDecoration;
