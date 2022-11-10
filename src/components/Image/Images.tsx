import React, { ReactElement, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import ImagesSkeleton, { useStyles } from "../Skeleton/ImagesSkeleton";
import Image from "./Image";
import NoImages from "./NoImages";
import { ImageDecorationProps } from "./Decoration/ImageDecoration";

export type ImagesProps = {
  /** Images to show */
  images?: ParseImage[];
  /** React query status of images */
  status: "success" | "loading" | "error";
  /** Color of the borders of the images */
  outlineColor: VariableColor;
  /** Function to get decorations given a particular image */
  getDecorations?: (
    image: ParseImage
  ) => Promise<ReactElement<ImageDecorationProps<any>>[]>;
};

/** Component showing a list of images */
const Images = ({
  images,
  status,
  outlineColor,
  getDecorations = () => Promise.resolve([]),
}: ImagesProps) => {
  const classes = useStyles();
  const [decorations, setDecorations] = useState<
    Record<string, ReactElement<ImageDecorationProps<any>>[]>
  >({});

  useEffect(() => {
    if (images) {
      images.forEach(async (image) => {
        const decorations = await getDecorations(image);
        setDecorations((prev) => ({
          ...prev,
          [image.id!]: decorations,
        }));
      });
    }
  }, [setDecorations, images, getDecorations]);

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
              decorations={decorations[image.id!]}
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
