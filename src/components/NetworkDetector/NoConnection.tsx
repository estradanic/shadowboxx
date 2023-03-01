import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Strings } from "../../resources";
import Void from "../Svgs/Void";

const useStyles = makeStyles(() => ({
  svgContainer: {
    textAlign: "center",
  },
  svgText: {
    fontSize: "medium",
  },
}));

export type NoConnectionProps = {
  text?: string;
};

const NoConnection = ({ text = Strings.error.noConnection }) => {
  const classes = useStyles();

  return (
    <Grid item className={classes.svgContainer}>
      <Void height="40vh" />
      <br />
      <Typography className={classes.svgText} variant="overline">
        {text}
      </Typography>
    </Grid>
  );
};

export default NoConnection;
