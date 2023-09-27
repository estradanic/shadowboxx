import React, { ForwardedRef } from "react";
import Parse from "parse";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ShareIcon from "@material-ui/icons/Share";
import Icon, { IconProps } from "@material-ui/core/Icon";
import classNames from "classnames";
import b64 from "base64-js";
import { readAndCompressImage } from "browser-image-resizer";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { forwardRef } from "react";
import { ParseImage } from "../../../classes";
import { useSnackbar } from "../../Snackbar/Snackbar";
import { useGlobalLoadingStore } from "../../../stores";
import { GetImageReturn } from "../../../types";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    borderRadius: "100%",
    border: `2px solid ${theme.palette.info.contrastText}`,
    display: "flex",
    "& > svg": {
      margin: "auto",
    },
  },
}));

export interface ShareImageDecorationProps
  extends Omit<
    ImageDecorationProps<IconProps>,
    "Component" | "description" | "corner" | "ComponentProps" | "onClick"
  > {
  /** Which corner of the image to render the decoration */
  corner?: ImageDecorationProps<IconProps>["corner"];
  /** Props to pass down to the icon */
  IconProps?: IconProps;
  /** The image to share */
  image: ParseImage;
  /** Callback fired when the image is shared */
  onClick?: (image: ParseImage) => void | Promise<void>;
}

const ShareImageDecorationIcon = forwardRef(
  (props: IconProps, ref: ForwardedRef<any>) => (
    <Icon {...props} ref={ref}>
      <ShareIcon />
    </Icon>
  )
);

/** Image decoration component to share the decorated image */
const ShareImageDecoration = ({
  corner = "bottomLeft",
  className: userClassName,
  IconProps = {},
  image,
  onClick: piOnClick,
  ...rest
}: ShareImageDecorationProps) => {
  const classes = useStyles();

  const { enqueueWarningSnackbar } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore(
    (state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
    })
  );

  const download = (input: File | string, extension: string = "png") => {
    const a = document.createElement("a");
    a.download = image.name;
    a.target = "_blank";
    a.download = image.name + "." + extension;
    if (typeof input !== "string") {
      const base64 = URL.createObjectURL(input);
      a.href = base64;
    } else {
      a.href = input;
    }
    a.click();
  };

  const downloadImage = async (image: ParseImage) => {
    const result: GetImageReturn = await Parse.Cloud.run("getImage", {
      imageId: image.objectId,
      variant: "full",
    });
    const arrayBuffer = b64.toByteArray(result.base64).buffer;
    const blob = new Blob([arrayBuffer], { type: result.mimeType });
    const file = new File([blob], image.name, { type: result.mimeType });
    const pngFile = await readAndCompressImage(file, {
      quality: 1,
      maxHeight: 2400,
      maxWidth: 2400,
      mimeType: "image/png",
    });
    const shareData = {
      files: [new File([pngFile], `${image.name}.png`, { type: "image/png" })],
      title: image.name,
    };
    if (navigator?.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error(error);
        enqueueWarningSnackbar(Strings.error.sharingImage);
        download(pngFile);
      }
    } else {
      download(pngFile);
    }
  };

  const downloadOther = async (image: ParseImage) => {
    const result: GetImageReturn = await Parse.Cloud.run("getImage", {
      imageId: image.objectId,
      variant: "full",
    });
    const arrayBuffer = b64.toByteArray(result.base64).buffer;
    const blob = new Blob([arrayBuffer], { type: result.mimeType });
    const file = new File([blob], image.name, { type: result.mimeType });
    const shareData = {
      files: [file],
      title: image.name,
    };
    const extension = result.mimeType.split("/")[1];
    if (navigator?.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error(error);
        enqueueWarningSnackbar(Strings.error.sharingImage);
        download(file, extension);
      }
    } else {
      download(file, extension);
    }
  };

  const onClick = async () => {
    startGlobalLoader();
    try {
      if (image.type === "image") {
        await downloadImage(image);
      } else {
        await downloadOther(image);
      }
      piOnClick?.(image);
    } catch (error) {
      console.error(error);
      enqueueWarningSnackbar(Strings.error.sharingImage);
    } finally {
      stopGlobalLoader();
    }
  };

  return (
    <ImageDecoration<IconProps>
      corner={corner}
      Component={ShareImageDecorationIcon}
      description={Strings.action.shareImage}
      ComponentProps={{
        fontSize: "large",
        ...IconProps,
      }}
      {...rest}
      className={classNames(classes.root, userClassName)}
      onClick={onClick}
    />
  );
};

export default ShareImageDecoration;
