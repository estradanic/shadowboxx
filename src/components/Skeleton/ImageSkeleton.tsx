import React, { ReactNode } from "react";
import Grid from "@material-ui/core/Grid";
import Skeleton from "./Skeleton";

export const DEFAULT_IMAGE_SKELETON_HEIGHT = "400px";
export const DEFAULT_IMAGE_SKELETON_WIDTH = "100%";

export interface ImageSkeletonProps {
  height?: string | number;
  width?: string | number;
  children?: ReactNode;
  className?: string;
}

/** A skeleton component to display an image */
const ImageSkeleton = ({
  height = DEFAULT_IMAGE_SKELETON_HEIGHT,
  width = DEFAULT_IMAGE_SKELETON_WIDTH,
  children,
  ...rest
}: ImageSkeletonProps) => (
  <Grid item xs={12} md={6} lg={4} xl={3} {...rest}>
    <Skeleton variant="rect" width={width} height={height} />
    {children}
  </Grid>
);

export default ImageSkeleton;
