import React, { ImgHTMLAttributes, memo } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import Tooltip from "../Tooltip/Tooltip";
import { ImageDecorationProps } from "./Decoration/ImageDecoration";
import VariableColor from "../../types/VariableColor";

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
}));

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  key?: string;
  alt: string;
  src: string;
  decorations?: React.ReactElement<ImageDecorationProps>[];
  borderColor?: VariableColor;
}

const Image = memo(
  ({
    className,
    key,
    alt,
    decorations,
    borderColor = "primary",
    ...rest
  }: ImageProps) => {
    const classes = useStyles({ borderColor });

    return (
      <div className={classNames(className, classes.root)} key={key}>
        <Tooltip title={alt}>
          <img className={classes.image} alt={alt} {...rest} />
        </Tooltip>
        {decorations?.map((decoration, index) =>
          React.cloneElement(decoration, { key: `decoration${index}` })
        )}
      </div>
    );
  }
);

export default Image;
