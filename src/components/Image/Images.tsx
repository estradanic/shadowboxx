import React, { ReactElement, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import { useVirtualList } from "../../hooks";
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
  /** Function to get a caption given a particular image */
  getCaption?: (image: ParseImage) => Promise<string | undefined>;
};

/** Component showing a list of images */
const Images = ({
  images,
  status,
  outlineColor,
  getDecorations,
  getCaption,
}: ImagesProps) => {
  const classes = useStyles();
  const [decorations, setDecorations] = useState<
    Record<string, ReactElement<ImageDecorationProps<any>>[]>
  >({});
  const [captions, setCaptions] = useState<Record<string, string | undefined>>(
    {}
  );

  useEffect(() => {
    if (images) {
      images.forEach(async (image) => {
        if (getDecorations) {
          const decorations = await getDecorations(image);
          setDecorations((prev) => ({
            ...prev,
            [image.id]: decorations,
          }));
        }
        if (getCaption) {
          const caption = await getCaption(image);
          setCaptions((prev) => ({
            ...prev,
            [image.id]: caption,
          }));
        }
      });
    }
  }, [setDecorations, images, getDecorations, getCaption, setCaptions]);

  const { virtualized: virtualizedImages } = useVirtualList<ParseImage>({
    list: images,
    interval: 10,
    enabled: images !== undefined,
  });

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
              decorations={decorations[image.id]}
              caption={captions[image.id]}
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
