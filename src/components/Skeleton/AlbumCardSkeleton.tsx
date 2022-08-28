import React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import Skeleton from "@material-ui/lab/Skeleton";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import StarIcon from "@material-ui/icons/Star";
import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.spacing(50),
    minWidth: theme.spacing(50),
    margin: theme.spacing(2),
  },
  cardMobile: {
    width: `calc(100vw - ${theme.spacing(4)}px)`,
    margin: theme.spacing(2),
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
}));

/** Component for displaying a placeholder for the AlbumCard component */
const AlbumCardSkeleton = () => {
  const classes = useStyles();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card className={mobile ? classes.cardMobile : classes.card}>
      <CardHeader
        avatar={<Skeleton variant="circle" />}
        action={
          <IconButton>
            <MoreVertIcon className={classes.icon} />
          </IconButton>
        }
        title={<Skeleton variant="text" />}
        subheader={<Skeleton variant="text" />}
      />
      <Skeleton variant="rect" height={300} />
      <CardContent className={classes.cardContent}>
        <Grid container>
          <Grid item xs={6}>
            <Skeleton variant="text" />
          </Grid>
          <Grid item xs={6}>
            <Skeleton variant="text" />
          </Grid>
          <Grid className={classes.collaborators} item container xs={12}>
            <Grid item>
              <Skeleton variant="circle" />
            </Grid>
            <Grid item>
              <Skeleton variant="circle" />
            </Grid>
            <Grid item>
              <Skeleton variant="circle" />
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
