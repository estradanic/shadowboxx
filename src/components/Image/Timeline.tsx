import React, { useEffect, useState, ReactNode } from "react";
import Grid from "@material-ui/core/Grid";
import MuiTimeline from "@material-ui/lab/Timeline";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineOppositeContent from "@material-ui/lab/TimelineOppositeContent";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import { makeStyles, Theme } from "@material-ui/core/styles";
import NotesIcon from "@material-ui/icons/Notes";
import Typography from "@material-ui/core/Typography";
import { VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import ImagesSkeleton from "../Skeleton/ImagesSkeleton";
import Image, { ImageProps } from "./Image";
import NoImages from "./NoImages";
import useImageStyles from "./useImageStyles";
import FancyTypography from "../Typography/FancyTypography";

type UseStylesParams = {
  color: VariableColor;
};

const useStyles = makeStyles((theme: Theme) => ({
  timelineSeparator: {
    "& *": {
      backgroundColor: ({ color }: UseStylesParams) =>
        theme.palette[color ?? "primary"].main,
    },
  },
  content: {
    transform: `translateY(-10%)`,
  },
  timeline: {
    paddingTop: theme.spacing(8),
  },
  caption: {
    lineHeight: "normal",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    borderRadius: "4px",
    border: ({ color }: UseStylesParams) =>
      `2px solid ${theme.palette[color ?? "primary"].main}`,
    marginTop: theme.spacing(0.5),
    [theme.breakpoints.up("md")]: {
      fontSize: "large",
    },
    boxShadow: theme.shadows[5],
    width: "100%",
    textAlign: "center",
    position: "relative",
  },
  captionIcon: {
    position: "absolute",
    left: theme.spacing(1.75),
    top: theme.spacing(1.75),
  },
  captionContainer: {
    display: "flex",
  },
  oppositeContent: {
    paddingBottom: theme.spacing(3),
  },
  date: {
    textShadow: "0px 3px 2px black",
    fontSize: "large",
    fontWeight: "bolder",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      fontSize: "x-large",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "xx-large",
    },
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
  /** Node to use as the FilterBar */
  filterBar?: ReactNode;
};

/** Component showing a list of images in a timeline */
const Timeline = ({
  images,
  status,
  outlineColor,
  getImageProps,
  filterBar,
}: TimelineProps) => {
  const imageClasses = useImageStyles();
  const classes = useStyles({ color: outlineColor });
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
            [image.objectId]: newImageProps,
          }));
        }
      });
    }
  }, [images, getImageProps, setImageProps]);

  let content: ReactNode;
  if (status === "loading" || (!images && status !== "error")) {
    content = <ImagesSkeleton />;
  } else if (status === "error" || !images?.length) {
    content = <NoImages />;
  } else {
    content = (
      <>
        <MuiTimeline align="alternate" className={classes.timeline}>
          {images?.map((image, i) => {
            const right = i % 2;
            const isNewDay =
              images[i - 1]?.dateTaken?.toLocaleDateString() !==
              image.dateTaken.toLocaleDateString();
            return (
              <TimelineItem key={image.objectId}>
                <TimelineOppositeContent
                  className={classes.oppositeContent}
                  style={right ? { paddingRight: 0 } : { paddingLeft: 0 }}
                >
                  {isNewDay && (
                    <FancyTypography className={classes.date}>
                      {image.dateTaken.toLocaleDateString()}
                    </FancyTypography>
                  )}
                </TimelineOppositeContent>
                <TimelineSeparator className={classes.timelineSeparator}>
                  {isNewDay && <TimelineDot />}
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent
                  className={classes.content}
                  style={right ? { paddingLeft: 0 } : { paddingRight: 0 }}
                >
                  <Image
                    borderColor={outlineColor}
                    parseImage={image}
                    showFullResolutionOnClick={true}
                    variant="bordered-no-padding"
                    {...imageProps[image.objectId]}
                  />
                  {imageProps[image.objectId]?.caption && (
                    <div className={classes.captionContainer}>
                      <Typography className={classes.caption}>
                        <NotesIcon className={classes.captionIcon} />
                        {imageProps[image.objectId]?.caption}
                      </Typography>
                    </div>
                  )}
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </MuiTimeline>
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

export default Timeline;
