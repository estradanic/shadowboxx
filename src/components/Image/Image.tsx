import React, { ImgHTMLAttributes, memo, useRef, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Popper from "@material-ui/core/Popper";
import Skeleton from "@material-ui/lab/Skeleton";
import classNames from "classnames";
import { VariableColor, ParseImage } from "../../types";
import { opacity } from "../../utils";
import Tooltip from "../Tooltip/Tooltip";
import { ImageDecorationProps } from "./Decoration/ImageDecoration";

interface UseStylesParams {
  borderColor: VariableColor;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    position: "relative",
  },
  image: {
    display: "block",
    borderRadius: theme.spacing(0.5),
    overflow: "hidden",
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor].dark}`,
    marginTop: "auto",
    marginBottom: "auto",
  },
  width100: {
    width: "100%",
  },
  pointer: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  fullResolution: {
    zIndex: 1200,
    width: "100vw",
    height: "100vh",
    display: "flex",
    backgroundColor: opacity(theme.palette.background.default, 0.7),
  },
  fullResolutionImage: {
    borderRadius: theme.spacing(0.5),
    overflow: "hidden",
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor].dark}`,
    margin: "auto",
    maxWidth: "90vw",
    maxHeight: "90vh",
  },
  displayNone: {
    display: "none",
  },
}));

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** React key passed to parent div */
  key?: string;
  /** Image to display */
  parseImage: ParseImage;
  /** Array of ImageDecorations */
  decorations?: React.ReactElement<ImageDecorationProps>[];
  /** CSS border color */
  borderColor?: VariableColor;
  /** Whether to show full resolution popup when the image is clicked */
  showFullResolutionOnClick?: boolean;
  /** Style variant */
  variant?: "bordered" | "contained";
};

/** Component showing an image in a pretty and functional way */
const Image = memo(
  ({
    className,
    key,
    decorations,
    borderColor = "primary",
    showFullResolutionOnClick,
    parseImage,
    variant = "bordered",
    onClick: piOnClick,
    ...rest
  }: ImageProps) => {
    const classes = useStyles({ borderColor });
    if (variant === "contained") {
      classes.image = "";
      classes.pointer = "";
      classes.root = "";
    }
    const [fullResolutionOpen, setFullResolutionOpen] = useState(false);
    const ref = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFullResolutionLoaded, setIsFullResolutionLoaded] = useState(false);

    const onClick = showFullResolutionOnClick ? () => setFullResolutionOpen(true) : piOnClick;

    return (
      <div className={classNames(className, classes.root)} key={key} ref={ref}>
        <Tooltip title={parseImage.name}>
          <>
            <picture
              className={classNames(classes.image, classes.width100, {
                [classes.pointer]: showFullResolutionOnClick,
                [classes.displayNone]: !isLoaded,
              })}
            >
              <source srcSet={parseImage.fileMobile.url()} type="image/webp" />
              <source srcSet={parseImage.fileLegacy?.url()} type="image/png" />
              <img
                className={classes.width100}
                onLoad={() => setIsLoaded(true)}
                alt={parseImage.name}
                src={parseImage.fileLegacy?.url()}
                onClick={onClick}
                {...rest}
              />
            </picture>
            {!isLoaded && (
              <Skeleton variant="rect" width="100%" height="700px" />
            )}
          </>
        </Tooltip>
        {decorations?.map((decoration, index) =>
          React.cloneElement(decoration, { key: `decoration${index}` })
        )}
        {showFullResolutionOnClick && (
          <Popper
            open={fullResolutionOpen}
            className={classes.fullResolution}
            onClick={() => setFullResolutionOpen(false)}
            anchorEl={ref.current}
          >
            <picture
              className={classNames(classes.fullResolutionImage, {
                [classes.displayNone]: !isFullResolutionLoaded,
              })}
            >
              <source srcSet={parseImage.file.url()} type="image/webp" />
              <source srcSet={parseImage.fileLegacy?.url()} type="image/png" />
              <img
                alt={parseImage.name}
                onLoad={() => setIsFullResolutionLoaded(true)}
                src={parseImage.fileLegacy?.url()}
              />
            </picture>
            {!isFullResolutionLoaded && (
              <Skeleton
                variant="rect"
                width="100%"
                height="700px"
                className={classes.fullResolutionImage}
              />
            )}
          </Popper>
        )}
      </div>
    );
  }
);

export default Image;
