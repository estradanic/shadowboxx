import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Strings } from "../../resources";
import BlankCanvas from "../Svgs/BlankCanvas";

const useStyles = makeStyles(() => ({
  svgContainer: {
    textAlign: "center",
  },
  svgText: {
    fontSize: "medium",
  },
}));

export type NoAlbumsProps = {
  text?: string;
};

const NoAlbums = ({ text = Strings.message.noAlbums }) => {
  const classes = useStyles();

  return (
    <Grid item className={classes.svgContainer}>
      <BlankCanvas height="40vh" />
      <br />
      <Typography className={classes.svgText} variant="overline">
        {text}
      </Typography>
      <br />
      <Typography variant="overline">
        {Strings.prompt.tryAddingAlbum}
      </Typography>
    </Grid>
  );
};

export default NoAlbums;
