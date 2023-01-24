import React, { ImgHTMLAttributes, memo, useRef, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import NotesIcon from "@material-ui/icons/Notes";
import Popper from "@material-ui/core/Popper";
import classNames from "classnames";
import { VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import { opacity } from "../../utils";
import Tooltip from "../Tooltip/Tooltip";
import { ImageDecorationProps } from "./Decoration/ImageDecoration";
import Skeleton from "../Skeleton/Skeleton";
import { IMAGE_SKELETON_HEIGHT } from "../Skeleton/ImageSkeleton";
import Typography from "@material-ui/core/Typography";

interface UseStylesParams {
  borderColor: VariableColor;
  hasCaption: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    position: "relative",
  },
  rootNoPadding: {
    position: "relative",
  },
  image: {
    boxShadow: theme.shadows[5],
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
    zIndex: theme.zIndex.modal,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2, 0),
    display: "flex",
    backgroundColor: opacity(theme.palette.background.default, 0.7),
    flexDirection: "column",
    overflowY: "auto",
  },
  fullResolutionImage: {
    borderRadius: theme.spacing(0.5),
    overflow: "hidden",
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor].dark}`,
    maxWidth: "90vw",
    maxHeight: "90vh",
  },
  fullResolutionPicture: {
    margin: "auto",
    marginBottom: ({ hasCaption }: UseStylesParams) =>
      hasCaption ? 0 : "auto",
  },
  fullResolutionSkeleton: {
    "&&": {
      maxWidth: "600px",
    },
    margin: "auto",
  },
  displayNone: {
    display: "none",
  },
  caption: {
    color: theme.palette.text.primary,
    fontSize: "large",
    textAlign: "center",
    margin: "auto",
    marginTop: 0,
    backgroundColor: opacity(theme.palette.background.paper, 0.9),
    maxWidth: "90vw",
    width: "max-content",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor].dark}`,
  },
  captionIcon: {
    color: theme.palette.text.primary,
    fontSize: "large",
    marginRight: theme.spacing(1),
  },
}));

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** React key passed to parent div */
  key?: string;
  /** Image to display */
  parseImage: ParseImage;
  /** Array of ImageDecorations */
  decorations?: React.ReactElement<ImageDecorationProps<any>>[];
  /** CSS border color */
  borderColor?: VariableColor;
  /** Whether to show full resolution popup when the image is clicked */
  showFullResolutionOnClick?: boolean;
  /** Style variant */
  variant?: "bordered" | "contained" | "bordered-no-padding";
  /** Caption text */
  caption?: string;
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
    caption,
    ...rest
  }: ImageProps) => {
    const classes = useStyles({ borderColor, hasCaption: !!caption });
    if (variant === "contained") {
      classes.image = "";
      classes.pointer = "";
      classes.root = "";
    } else if (variant === "bordered-no-padding") {
      classes.root = classes.rootNoPadding;
    }
    const [fullResolutionOpen, setFullResolutionOpen] = useState(false);
    const ref = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFullResolutionLoaded, setIsFullResolutionLoaded] = useState(false);

    const onClick = showFullResolutionOnClick
      ? () => setFullResolutionOpen(true)
      : piOnClick;

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
              <source
                srcSet={parseImage.fileMobile?.url?.()}
                type="image/webp"
              />
              <source
                srcSet={parseImage.fileLegacy?.url?.()}
                type="image/png"
              />
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
              <Skeleton
                variant="rect"
                width="100%"
                height={IMAGE_SKELETON_HEIGHT}
              />
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
              className={classNames(classes.fullResolutionPicture, {
                [classes.displayNone]: !isFullResolutionLoaded,
              })}
            >
              <source srcSet={parseImage.file.url()} type="image/webp" />
              <source srcSet={parseImage.fileLegacy?.url()} type="image/png" />
              <img
                className={classes.fullResolutionImage}
                alt={parseImage.name}
                onLoad={() => setIsFullResolutionLoaded(true)}
                src={parseImage.fileLegacy?.url()}
              />
            </picture>
            <Typography
              className={classNames(classes.caption, {
                [classes.displayNone]:
                  !isFullResolutionLoaded ||
                  (!caption && !parseImage.dateTaken),
              })}
            >
              <NotesIcon className={classes.captionIcon} />
              {`${
                caption ? caption : ""
              } ${parseImage.dateTaken.toLocaleDateString()}`}
            </Typography>
            {!isFullResolutionLoaded && (
              <Skeleton
                variant="rect"
                width="90vw"
                height="90vh"
                className={classNames(
                  classes.fullResolutionImage,
                  classes.fullResolutionSkeleton
                )}
              />
            )}
          </Popper>
        )}
      </div>
    );
  }
);

export default Image;
