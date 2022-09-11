import React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import Skeleton from "@material-ui/lab/Skeleton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import StarIcon from "@material-ui/icons/Star";
import classNames from "classnames";
import AvatarSkeleton from "./AvatarSkeleton";
import { CardMedia } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.spacing(50),
    width: "100%",
    margin: "auto",
  },
  addImages: {
    marginLeft: "auto",
  },
  icon: {
    color: theme.palette.text.primary,
  },
  collaboratorAvatar: {
    marginRight: theme.spacing(1),
  },
  cardContent: {
    paddingBottom: 0,
  },
  collaborators: {
    marginTop: theme.spacing(1),
  },
  title: {
    marginLeft: "auto",
    marginRight: "auto",
    width: theme.spacing(14)
  },
}));

/** Component for displaying a placeholder for the AlbumCard component */
const AlbumCardSkeleton = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={<AvatarSkeleton />}
        action={
          <IconButton>
            <MoreVertIcon className={classes.icon} />
          </IconButton>
        }
        title={<Skeleton className={classes.title} variant="text" />}
        subheader={<Skeleton variant="text" />}
      />
      <CardMedia
        component={Skeleton}
        variant="rect"
        height={300}
      />
      <CardContent className={classes.cardContent}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Skeleton variant="text" />
          </Grid>
          <Grid item xs={6}>
            <Skeleton variant="text" />
          </Grid>
          <Grid className={classes.collaborators} item container xs={12} spacing={1}>
            <Grid item>
              <AvatarSkeleton />
            </Grid>
            <Grid item>
            <AvatarSkeleton />
            </Grid>
            <Grid item>
            <AvatarSkeleton />
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton>
          <StarIcon className={classes.icon} />
        </IconButton>
        <IconButton>
          <AddAPhotoIcon
            className={classNames(classes.icon, classes.addImages)}
          />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default AlbumCardSkeleton;
