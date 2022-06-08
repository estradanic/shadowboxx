import React, { useEffect, useRef, useState } from "react";
import { useView } from "../View";
import { BackButton, PageContainer, useSnackbar } from "../../components";
import { useLocation, useParams } from "react-router-dom";
import ParseAlbum from "../../types/Album";
import Strings from "../../resources/Strings";
import { useNavigationContext } from "../../app/NavigationContext";
import { Grid, Typography } from "@material-ui/core";
import Void from "../../components/Svgs/Void";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ParseImage from "../../types/Image";
import FancyTitleTypography from "../../components/Typography/FancyTitleTypography";

const useStyles = makeStyles((theme: Theme) => ({
  albumNotFoundContainer: {
    textAlign: "center",
  },
  albumNotFound: {
    fontSize: "medium",
  },
  image: {
    width: theme.spacing(35),
    display: "block",
    borderRadius: theme.spacing(0.5),
    overflow: "hidden",
    minWidth: theme.spacing(50),
    flexBasis: "20%",
    margin: theme.spacing(2),
    flexGrow: 1,
    flexShrink: 1,
  },
  imageContainer: {
    display: "flex",
    flexDirection: "row",
    paddingTop: theme.spacing(10),
  },
}));

/**
 * Page for viewing an album
 */
const Album = () => {
  useView("Album");
  const { search } = useLocation();
  const [album, setAlbum] = useState<ParseAlbum>();
  const { enqueueErrorSnackbar } = useSnackbar();
  const { setGlobalLoading, globalLoading } = useNavigationContext();
  const gotAlbum = useRef(false);
  const gotImages = useRef(false);
  const { id } = useParams<{ id: string }>();
  const classes = useStyles();
  const [images, setImages] = useState<ParseImage[]>();

  useEffect(() => {
    if (!gotAlbum.current && !globalLoading) {
      if (id) {
        setGlobalLoading(true);
        ParseAlbum.query()
          .equalTo(ParseAlbum.COLUMNS.id, id)
          .first()
          .then((response) => {
            if (response) {
              const newAlbum = new ParseAlbum(response);
              setAlbum(newAlbum);
              ParseImage.query()
                .containedIn(ParseImage.COLUMNS.id, newAlbum.images)
                .findAll()
                .then((imageResponse) => {
                  setImages(
                    imageResponse.map((image) => new ParseImage(image))
                  );
                })
                .catch((e) => {
                  enqueueErrorSnackbar(Strings.getImagesError());
                })
                .finally(() => {
                  gotImages.current = true;
                  setGlobalLoading(!gotAlbum.current);
                });
            } else {
              enqueueErrorSnackbar(Strings.albumNotFound(id));
            }
          })
          .catch((e) => {
            enqueueErrorSnackbar(e.message ?? Strings.getAlbumError());
          })
          .finally(() => {
            gotAlbum.current = true;
            setGlobalLoading(!gotImages.current);
          });
      } else {
        enqueueErrorSnackbar(Strings.noAlbumId());
      }
    }
  }, [search, enqueueErrorSnackbar, globalLoading, id, setGlobalLoading]);

  return (
    <PageContainer>
      {album ? (
        <>
          <Grid item sm={8}>
            <FancyTitleTypography>{album.name}</FancyTitleTypography>
          </Grid>
          <Grid item container className={classes.imageContainer} xs={12}>
            {images?.map((image) => (
              <img
                key={image.id}
                className={classes.image}
                src={image.file.url()}
                alt={image.file.name()}
              />
            ))}
          </Grid>
        </>
      ) : (
        <Grid item className={classes.albumNotFoundContainer}>
          <Void height="40vh" />
          <br />
          <Typography className={classes.albumNotFound} variant="overline">
            {Strings.albumNotFound()}
          </Typography>
          <br />
          <BackButton color="inherit" placement="body" variant="text" />
        </Grid>
      )}
    </PageContainer>
  );
};

export default Album;
