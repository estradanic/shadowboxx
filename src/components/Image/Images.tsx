import React, { useEffect, useState, ReactNode } from "react";
import Grid from "@material-ui/core/Grid";
import { VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import ImagesSkeleton from "../Skeleton/ImagesSkeleton";
import Image, { ImageProps } from "./Image";
import NoImages from "./NoImages";
import useImageStyles from "./useImageStyles";
import useImageJobs from "../../hooks/useImageJobs";
import ImageJobPlaceholder from "./ImageJobPlaceholder";

export type ImagesProps = {
  /** Images to show */
  images?: ParseImage[];
  /** React query status of images */
  status: "success" | "loading" | "error" | "refetching";
  /** Color of the borders of the images */
  outlineColor: VariableColor;
  /** Function to get ImageProps given a particulat image */
  getImageProps?: (image: ParseImage) => Promise<Partial<ImageProps>>;
  /** Node to use as the FilterBar */
  filterBar?: ReactNode;
  /** Album id associated with these images */
  albumId?: string;
};

/** Component showing a list of images */
const Images = ({
  images,
  status,
  outlineColor,
  getImageProps,
  filterBar,
  albumId,
}: ImagesProps) => {
  const imageClasses = useImageStyles();
  const [imageProps, setImageProps] = useState<
    Record<string, Partial<ImageProps>>
  >({});

  const imageJobs = useImageJobs(albumId);

  useEffect(() => {
    if (images) {
      images.forEach(async (image) => {
        if (getImageProps) {
          const newImageProps = await getImageProps(image);
          setImageProps((prev) => ({
            ...prev,
            [image.objectId]: newImageProps,
          }));
        }
      });
    }
  }, [images, getImageProps, setImageProps]);

  let content: ReactNode;
  if (status === "loading" || (!images && status !== "error")) {
    content = <ImagesSkeleton />;
  } else if (status === "error" || (!images?.length && !imageJobs.length)) {
    content = <NoImages />;
  } else {
    content = (
      <>
        {imageJobs.map((job) => (
          <ImageJobPlaceholder key={`job-${job.id}`} job={job} />
        ))}
        {images?.map((image) => (
          <Grid key={image.objectId} item xs={12} md={6} lg={4} xl={3}>
            <Image
              borderColor={outlineColor}
              parseImage={image}
              showFullResolutionOnClick={true}
              {...imageProps[image.objectId]}
            />
          </Grid>
        ))}
      </>
    );
  }

  return (
    <Grid item container className={imageClasses.imageContainer} xs={12}>
      {filterBar}
      {content}
    </Grid>
  );
};

export default Images;
