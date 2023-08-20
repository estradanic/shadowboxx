import React from "react";
import Grid from "@material-ui/core/Grid";
import Skeleton from "./Skeleton";

export const IMAGE_SKELETON_HEIGHT = "400px";

/** A skeleton component to display an image */
const ImageSkeleton = () => (
  <Grid item xs={12} md={6} lg={4} xl={3}>
    <Skeleton variant="rect" width="100%" height={IMAGE_SKELETON_HEIGHT} />
  </Grid>
);

export default ImageSkeleton;
