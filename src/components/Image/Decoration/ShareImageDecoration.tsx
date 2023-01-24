import React, { ForwardedRef } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ShareIcon from "@material-ui/icons/Share";
import Icon, { IconProps } from "@material-ui/core/Icon";
import classNames from "classnames";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { forwardRef } from "react";
import { ParseImage } from "../../../classes";
import { useSnackbar } from "../../Snackbar/Snackbar";
import { useGlobalLoadingStore } from "../../../stores";
import { readAndCompressImage } from "browser-image-resizer";

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

  const download = (file: File) => {
    const base64 = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = base64;
    a.download = image.name;
    a.target = "_blank";
    a.download = image.name + ".png";
    a.click();
  };

  const onClick = async () => {
    startGlobalLoader();
    const buffer = await (await fetch(image.file.url())).arrayBuffer();
    const file = new File([buffer], image.name, { type: "image/webp" });
    const pngFile = await readAndCompressImage(file, {
      quality: 1,
      mimeType: "image/png",
    });
    if (navigator?.canShare?.({ files: [pngFile] })) {
      try {
        await navigator.share({
          files: [pngFile],
          title: image.name,
          text: image.name,
        });
      } catch (error) {
        console.error(error);
        enqueueErrorSnackbar(Strings.cantShare());
        download(pngFile);
      }
    } else {
      download(pngFile);
    }
    stopGlobalLoader();
    piOnClick?.(image);
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
