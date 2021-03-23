import React, {useState} from "react";
import {
  Card,
  CardHeader,
  IconButton,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Grid,
} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {MoreVert, Share, Star} from "@material-ui/icons";
import {UserInfo, useUserContext} from "../../app/UserContext";
import Strings from "../../resources/Strings";
import UserAvatar from "../User/UserAvatar";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.spacing(50),
    margin: "auto",
    cursor: "pointer",
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
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
  title: {
    fontWeight: "bold",
  },
  icon: {
    color: theme.palette.text.primary,
  },
}));

export interface AlbumCardProps {
  name: string;
  description?: string;
  coverImgSrc: string;
  coverImgName?: string;
  favorite?: boolean;
  collaborators?: UserInfo[];
  owner?: UserInfo;
  viewers?: UserInfo[];
  lastEdited: Date;
  created: Date;
  numOfPhotos: number;
}

const AlbumCard = ({
  name,
  lastEdited,
  created,
  numOfPhotos,
  coverImgSrc,
  coverImgName,
  description = "",
  favorite: piFavorite = false,
  collaborators = [],
  owner,
  viewers = [],
}: AlbumCardProps) => {
  const {firstName, lastName, email} = useUserContext();
  const [favorite, setFavorite] = useState<boolean>(piFavorite);
  const toggleFavorite = () => {
    setFavorite((prev) => !prev);
  };

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader
        classes={{title: classes.title}}
        avatar={<UserAvatar user={owner ?? {firstName, lastName, email}} />}
        action={
          <IconButton>
            <MoreVert className={classes.icon} />
          </IconButton>
        }
        title={name}
        subheader={`${Strings.numOfPhotos(numOfPhotos)} ${description}`}
      />
      <CardMedia
        className={classes.media}
        image={coverImgSrc}
        title={coverImgName}
      />
      <CardContent>
        <Grid container>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary" component="p">
              {Strings.created(created)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography
              className={classes.lastEdited}
              variant="body2"
              color="textSecondary"
              component="p"
            >
              {Strings.lastEdited(lastEdited)}
            </Typography>
          </Grid>
          {!!collaborators.length && (
            <Grid item xs={12}>
              {collaborators.map((collaborator) => (
                <UserAvatar user={collaborator} />
              ))}
            </Grid>
          )}
          {!!viewers.length && (
            <Grid item xs={12}>
              {viewers.map((viewer) => (
                <UserAvatar user={viewer} />
              ))}
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton onClick={toggleFavorite}>
          <Star className={favorite ? classes.favorite : classes.icon} />
        </IconButton>
        <IconButton className={classes.share}>
          <Share className={classes.icon} />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default AlbumCard;
