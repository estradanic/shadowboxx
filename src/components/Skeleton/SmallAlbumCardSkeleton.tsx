import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    display: "flex",
    flexDirection: "row",
    height: theme.spacing(14),
  },
  info: {
    flexShrink: 0,
    flexGrow: 1,
    flexBasis: "auto",
  },
  coverImage: {
    height: theme.spacing(14),
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: theme.spacing(14),
  },
}));

/** A skeleton component to display a small album card */
const SmallAlbumCardSkeleton = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.info}>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </CardContent>
      <CardMedia
        className={classes.coverImage}
        component={Skeleton}
        variant="rect"
      />
    </Card>
  );
};

export default SmallAlbumCardSkeleton;
