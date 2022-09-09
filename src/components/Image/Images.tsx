import React from "react";
import Grid from "@material-ui/core/Grid";
import { ParseImage, VariableColor } from "../../types";
import ImagesSkeleton, { useStyles } from "../Skeleton/ImagesSkeleton";
import Image from "./Image";
import NoImages from "./NoImages";

export type ImagesProps = {
  images?: ParseImage[];
  status: "success" | "loading" | "error";
  outlineColor: VariableColor;
};

const Images = ({ images, status, outlineColor }: ImagesProps) => {
  const classes = useStyles();

  if (status === "loading" || (!images && status !== "error")) {
    return <ImagesSkeleton />;
  } else if (status === "error" || !images?.length) {
    return <NoImages />;
  } else {
    return (
      <Grid item container className={classes.imageContainer} xs={12}>
        {images?.map((image) => (
          <Grid key={image.id} item xs={12} md={6} lg={4} xl={3}>
            <Image
              borderColor={outlineColor}
              parseImage={image}
              showFullResolutionOnClick
            />
          </Grid>
        ))}
      </Grid>
    );
  }
};

export default Images;
