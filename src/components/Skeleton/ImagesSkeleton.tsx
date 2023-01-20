import React from "react";
import Grid from "@material-ui/core/Grid";
import ImageSkeleton from "./ImageSkeleton";
import useImageStyles from "../Image/useImageStyles";

const ImagesSkeleton = () => {
  const classes = useImageStyles();

  return (
    <Grid item spacing={2} container className={classes.imageContainer} xs={12}>
      <ImageSkeleton />
      <ImageSkeleton />
      <ImageSkeleton />
      <ImageSkeleton />
      <ImageSkeleton />
      <ImageSkeleton />
    </Grid>
  );
};

export default ImagesSkeleton;
