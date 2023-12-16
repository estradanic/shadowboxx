import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { ParseImage } from "../../classes";
import { JobInfo } from "../../contexts/JobContext";
import LoadingWrapper from "../Loader/LoadingWrapper";
import { Skeleton } from "../Skeleton";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { ACCEPTABLE_VIDEO_TYPES } from "../../contexts/ImageContext";

const useStyles = makeStyles((theme: Theme) => ({
  skeletonWrapper: {
    padding: theme.spacing(2),
  },
  image: {
    width: "100%",
  },
}));

export interface ImageJobPlaceholderProps {
  job: JobInfo<ParseImage>;
  className?: string;
}

/** Component to display an image placeholder while it is processing/uploading */
const ImageJobPlaceholder = ({ job, className }: ImageJobPlaceholderProps) => {
  const classes = useStyles();
  const [dataUrl, setDataUrl] = useState<string>();
  const type = ACCEPTABLE_VIDEO_TYPES.includes(job.file?.type ?? "")
    ? "video"
    : "image";

  useEffect(() => {
    const file = job.file;
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setDataUrl(blobUrl);
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }
  }, [job.file, setDataUrl]);

  return (
    <Grid item xs={12} md={6} lg={4} xl={3} className={className}>
      <LoadingWrapper
        className={classes.skeletonWrapper}
        loading={true}
        global={false}
        progress={job.progress}
        type={
          [0, 100, undefined].includes(job.progress)
            ? "indeterminate"
            : "determinate"
        }
      >
        {dataUrl ? (
          type === "image" ? (
            <img src={dataUrl} className={classes.image} />
          ) : (
            <video preload="metadata" controls={false} src={dataUrl} className={classes.image} />
          )
        ) : (
          <Skeleton variant="rect" width="100%" height="300px" />
        )}
      </LoadingWrapper>
    </Grid>
  );
};

export default ImageJobPlaceholder;
