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

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    borderRadius: "100%",
    border: `2px solid ${theme.palette.info.contrastText}`,
    display: "flex",
    "& > svg": {
      margin: "auto",
      marginRight: "5px",
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

  const onClick = async () => {
    const base64 = await image.fileLegacy.getData();
    const file = new File([base64], image.name, {
      type: "image/png",
    });
    if (navigator?.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: image.name,
          text: image.name,
        });
      } catch (error) {
        console.error(error);
        enqueueErrorSnackbar(Strings.commonError());
      }
    } else {
      const a = document.createElement("a");
      a.href = image.fileLegacy.url();
      a.download = image.name;
      a.target = "_blank";
      a.download = image.name + ".png";
      a.click();
    }
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
