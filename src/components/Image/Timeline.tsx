import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import MuiTimeline from "@material-ui/lab/Timeline";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineOppositeContent from "@material-ui/lab/TimelineOppositeContent";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import { useVirtualList } from "../../hooks";
import ImagesSkeleton from "../Skeleton/ImagesSkeleton";
import Image, { ImageProps } from "./Image";
import NoImages from "./NoImages";
import useImageStyles from "./useImageStyles";
import FancyTypography from "../Typography/FancyTypography";

type UseStylesParams = {
  color: VariableColor;
}

const useStyles = makeStyles((theme: Theme) => ({
  timelineSeparator: {
    "& *": {
      backgroundColor: ({color}: UseStylesParams) => theme.palette[color ?? "primary"].main,
    }
  },
  content: {
    transform: `translateY(${theme.spacing(-6)}px)`,
  },
  timeline: {
    paddingTop: theme.spacing(6),
  },
}));

export type TimelineProps = {
  /** Images to show */
  images?: ParseImage[];
  /** React query status of images */
  status: "success" | "loading" | "error" | "refetching";
  /** Color of the borders of the images */
  outlineColor: VariableColor;
  /** Function to get ImageProps given a particulat image */
  getImageProps?: (image: ParseImage) => Promise<Partial<ImageProps>>;
};

/** Component showing a list of images in a timeline */
const Timeline = ({
  images,
  status,
  outlineColor,
  getImageProps,
}: TimelineProps) => {
  const imageClasses = useImageStyles();
  const classes = useStyles({color: outlineColor})
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
      <Grid item container className={imageClasses.imageContainer} xs={12}>
        <MuiTimeline align="alternate" className={classes.timeline}>
          {virtualizedImages?.map((image, i) => (
            <TimelineItem key={image.id}>
              <TimelineOppositeContent>
                {
                  virtualizedImages[i - 1]?.dateTaken?.toLocaleDateString() !== image.dateTaken.toLocaleDateString() &&
                    <FancyTypography style={{fontSize: "x-large"}}>
                      {image.dateTaken.toLocaleDateString()}
                    </FancyTypography>
                }
                <Typography variant="overline">
                  {imageProps[image.id]?.caption}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator className={classes.timelineSeparator}>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent className={classes.content}>
                <Image
                  borderColor={outlineColor}
                  parseImage={image}
                  showFullResolutionOnClick={true}
                  {...imageProps[image.id]}
                />
              </TimelineContent>
            </TimelineItem>
          ))}
        </MuiTimeline>
      </Grid>
    );
  }
};

export default Timeline;
