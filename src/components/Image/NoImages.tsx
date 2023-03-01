import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Empty from "../Svgs/Empty";
import { Strings } from "../../resources";

const useStyles = makeStyles(() => ({
  svgContainer: {
    textAlign: "center",
  },
  svgText: {
    fontSize: "medium",
  },
}));

export type NoImagesProps = {
  text?: string;
};

const NoImages = ({ text = Strings.message.noImages }: NoImagesProps) => {
  const classes = useStyles();

  return (
    <Grid item className={classes.svgContainer}>
      <Empty height="40vh" />
      <br />
      <Typography className={classes.svgText} variant="overline">
        {text}
      </Typography>
    </Grid>
  );
};

export default NoImages;
