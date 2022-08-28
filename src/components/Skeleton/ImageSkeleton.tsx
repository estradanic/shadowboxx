import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import Grid from "@material-ui/core/Grid";

const ImageSkeleton = () => (
  <Grid item xs={12} md={6} lg={4} xl={3}>
    <Skeleton variant="rect" width="100%" height="900px" />
  </Grid>
);

export default ImageSkeleton;
