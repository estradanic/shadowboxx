import React, { ImgHTMLAttributes, memo, useRef, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Popper } from "@material-ui/core";
import classNames from "classnames";
import { VariableColor, Interdependent } from "../../types";
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
}));

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> &
  Interdependent<
    {
      /** React key passed to parent div */
      key?: string;
      /** Html img alt attribute */
      alt: string;
      /** Html img src attribute */
      src: string;
      /** Array of ImageDecorations */
      decorations?: React.ReactElement<ImageDecorationProps>[];
      /** CSS border color */
      borderColor?: VariableColor;
      /** Html img src attribute for the full resolution image */
      fullResolutionSrc: string;
      /** Whether to show full resolution popup when the image is clicked */
      showFullResolutionOnClick: boolean;
    },
    "fullResolutionSrc" | "showFullResolutionOnClick"
  >;

/** Component showing an image in a pretty and functional way */
const Image = memo(
  ({
    className,
    key,
    alt,
    decorations,
    borderColor = "primary",
    fullResolutionSrc,
    showFullResolutionOnClick,
    ...rest
  }: ImageProps) => {
    const classes = useStyles({ borderColor });
    const [fullResolutionOpen, setFullResolutionOpen] =
      useState<boolean>(false);
    const ref = useRef(null);

    return (
      <div className={classNames(className, classes.root)} key={key} ref={ref}>
        <Tooltip title={alt}>
          <img
            className={classNames(classes.image, {
              [classes.pointer]: showFullResolutionOnClick,
            })}
            alt={alt}
            {...rest}
            onClick={() => setFullResolutionOpen(true)}
          />
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
            <img
              className={classes.fullResolutionImage}
              alt={alt}
              src={fullResolutionSrc}
            />
          </Popper>
        )}
      </div>
    );
  }
);

export default Image;
