import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import ImagesSkeleton from "../Skeleton/ImagesSkeleton";
import Image, { ImageProps } from "./Image";
import NoImages from "./NoImages";
import useImageStyles from "./useImageStyles";
import useVirtualList from "../../hooks/useVirtualList";

export type ImagesProps = {
  /** Images to show */
  images?: ParseImage[];
  /** React query status of images */
  status: "success" | "loading" | "error" | "refetching";
  /** Color of the borders of the images */
  outlineColor: VariableColor;
  /** Function to get ImageProps given a particulat image */
  getImageProps?: (image: ParseImage) => Promise<Partial<ImageProps>>;
};

/** Component showing a list of images */
const Images = ({
  images,
  status,
  outlineColor,
  getImageProps,
}: ImagesProps) => {
  const classes = useImageStyles();
  const [imageProps, setImageProps] = useState<
    Record<string, Partial<ImageProps>>
  >({});

  useEffect(() => {
    if (images) {
      images.forEach(async (image) => {
        if (getImageProps) {
          const newImageProps = await getImageProps(image);
          setImageProps((prev) => ({
            ...prev,
            [image.id]: newImageProps,
          }));
        }
      });
    }
  }, [images, getImageProps, setImageProps]);

  const virtualizedImages = useVirtualList(images);

  if (status === "loading" || (!images && status !== "error")) {
    return <ImagesSkeleton />;
  } else if (status === "error" || !images?.length) {
    return <NoImages />;
  } else {
    return (
      <Grid item container className={classes.imageContainer} xs={12}>
        {virtualizedImages?.map((image) => (
          <Grid key={image.id} item xs={12} md={6} lg={4} xl={3}>
            <Image
              borderColor={outlineColor}
              parseImage={image}
              showFullResolutionOnClick={true}
              {...imageProps[image.id]}
            />
          </Grid>
        ))}
      </Grid>
    );
  }
};

export default Images;
