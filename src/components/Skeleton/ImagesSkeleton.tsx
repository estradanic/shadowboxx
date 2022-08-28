import React from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles, Theme} from "@material-ui/core/styles";
import ImageSkeleton from "./ImageSkeleton";

export const useStyles = makeStyles((theme: Theme) => ({
  imageContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(7),
  },
}));

const ImagesSkeleton = () => {
  const classes = useStyles();

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
