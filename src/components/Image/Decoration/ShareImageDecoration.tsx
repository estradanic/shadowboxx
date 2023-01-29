import React, { ForwardedRef } from "react";
import Parse from "parse";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ShareIcon from "@material-ui/icons/Share";
import Icon, { IconProps } from "@material-ui/core/Icon";
import classNames from "classnames";
import { Buffer } from "buffer";
import { readAndCompressImage } from "browser-image-resizer";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { forwardRef } from "react";
import { ParseImage } from "../../../classes";
import { useSnackbar } from "../../Snackbar/Snackbar";
import { useGlobalLoadingStore } from "../../../stores";

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
  corner?: ImageDecorationProps<IconProps>["corner"];
  IconProps?: IconProps;
  image: ParseImage;
  onClick?: (image: ParseImage) => void | Promise<void>;
}

const ShareImageDecorationIcon = forwardRef(
  (props: IconProps, ref: ForwardedRef<any>) => (
    <Icon {...props} ref={ref}>
      <ShareIcon />
    </Icon>
  )
);

const ShareImageDecoration = ({
  corner = "bottomLeft",
  className: userClassName,
  IconProps = {},
  image,
  onClick: piOnClick,
  ...rest
}: ShareImageDecorationProps) => {
  const classes = useStyles();

  const { enqueueErrorSnackbar } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore(
    (state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
    })
  );

  const download = (input: File | string) => {
    const a = document.createElement("a");
    a.download = image.name;
    a.target = "_blank";
    a.download = image.name + ".png";
    if (typeof input !== "string") {
      const base64 = URL.createObjectURL(input);
      a.href = base64;
    } else {
      a.href = input;
    }
    a.click();
  };

  const onClick = async () => {
    startGlobalLoader();
    try {
      const base64: string = await Parse.Cloud.run("getImage", {
        imageId: image.id,
      });
      const buffer = Buffer.from(base64, "base64");
      const file = new File([buffer], image.name, { type: "image/webp" });
      const pngFile = await readAndCompressImage(file, {
        quality: 1,
        maxHeight: 2400,
        maxWidth: 2400,
        mimeType: "image/png",
      });
      const shareData = {
        files: [
          new File([pngFile], `${image.name}.png`, { type: "image/png" }),
        ],
        title: image.name,
      };
      if (navigator?.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.error(error);
          enqueueErrorSnackbar(Strings.cantShare());
          download(pngFile);
        }
      } else {
        download(pngFile);
      }
      piOnClick?.(image);
    } catch (error) {
      console.error(error);
      enqueueErrorSnackbar(Strings.cantShare());
      download(image.fileLegacy.url());
    } finally {
      stopGlobalLoader();
    }
  };

  return (
    <ImageDecoration<IconProps>
      corner={corner}
      Component={ShareImageDecorationIcon}
      description={Strings.removeImage()}
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
