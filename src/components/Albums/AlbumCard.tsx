import React, { useState } from "react";
import {Card, CardHeader, IconButton, CardMedia, CardContent, Typography, CardActions, Grid} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {MoreVert, Share, Star} from "@material-ui/icons";
import {UserInfo, useUserContext} from "../../app/UserContext";
import Strings from "../../resources/Strings";
import UserAvatar from "../User/UserAvatar";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.spacing(50),
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  avatar: {
    backgroundColor: theme.palette.success.main,
  },
  favorite: {
    color: theme.palette.warning.light,
  },
  share: {
    marginLeft: "auto",
  },
  lastEdited: {
    float: "right",
  },
}));

export interface AlbumCardProps {
  name: string,
  description?: string,
  coverImgSrc: string,
  coverImgName?: string,
  favorite?: boolean,
  collaborators?: UserInfo[],
  owner?: UserInfo,
  viewers?: UserInfo[],
  lastEdited: Date,
  created: Date,
  numOfPhotos: number,
};

const AlbumCard = ({name, lastEdited, created, numOfPhotos, coverImgSrc, coverImgName, description = "", favorite: piFavorite = false, collaborators = [], owner, viewers = []}: AlbumCardProps) => {
  const {firstName, lastName, email} = useUserContext();
  if (!owner) {
    owner = {firstName, lastName, email};
  }
  const [favorite, setFavorite] = useState<boolean>(piFavorite);
  const toggleFavorite = () => {
    setFavorite((prev) => !prev);
  }

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={<UserAvatar user={owner} />}
        action={<IconButton><MoreVert /></IconButton>}
        title={name}
        subheader={`${Strings.numOfPhotos(numOfPhotos)} ${description}`} />
      <CardMedia
        className={classes.media}
        image={coverImgSrc}
        title={coverImgName} />
      <CardContent>
        <Grid container>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary" component="p">
              {Strings.created(created)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography className={classes.lastEdited} variant="body2" color="textSecondary" component="p">
              {Strings.lastEdited(lastEdited)}
            </Typography>
          </Grid>
          {!!collaborators.length &&
            <Grid item xs={12}>
              {collaborators.map((collaborator) => <UserAvatar user={collaborator} />)}
            </Grid>
          }
          {!!viewers.length &&
            <Grid item xs={12}>
              {viewers.map((viewer) => <UserAvatar user={viewer} />)}
            </Grid>
          }
        </Grid>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton onClick={toggleFavorite}>
          <Star className={favorite ? classes.favorite : undefined} />
        </IconButton>
        <IconButton className={classes.share}>
          <Share />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default AlbumCard;