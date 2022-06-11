import React, { useEffect, useRef, useState } from "react";
import { BackButton, PageContainer, useSnackbar } from "../../components";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Strings } from "../../resources";
import { ParseImage, ParseAlbum } from "../../types";
import { Empty, Image, FancyTitleTypography, Void } from "../../components";
import { useRandomColor } from "../../hooks";
import { useGlobalLoadingContext } from "../../contexts";
import { useView } from "../View";

const useStyles = makeStyles((theme: Theme) => ({
  svgContainer: {
    textAlign: "center",
  },
  svgText: {
    fontSize: "medium",
  },
  imageContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(7),
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
  const { setGlobalLoading, globalLoading } = useGlobalLoadingContext();
  const gotAlbum = useRef(false);
  const gotImages = useRef(false);
  const { id } = useParams<{ id: string }>();
  const classes = useStyles();
  const [images, setImages] = useState<ParseImage[]>();
  const history = useHistory();
  const randomColor = useRandomColor();

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
              setGlobalLoading(!gotImages.current);
            } else {
              enqueueErrorSnackbar(Strings.albumNotFound(id));
              setGlobalLoading(false);
            }
          })
          .catch((e) => {
            enqueueErrorSnackbar(e.message ?? Strings.getAlbumError());
            setGlobalLoading(false);
          })
          .finally(() => {
            gotAlbum.current = true;
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
            <FancyTitleTypography outlineColor={randomColor}>
              {album.name}
            </FancyTitleTypography>
          </Grid>
          {images ? (
            <Grid item container className={classes.imageContainer} xs={12}>
              {[...images]
                .sort((a, b) => a.compareTo(b))
                ?.map((image) => (
                  <Grid key={image.id} item xs={12} md={6} lg={4}>
                    <Image
                      borderColor={randomColor}
                      src={image.file.url()}
                      alt={image.file.name()}
                    />
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Grid item className={classes.svgContainer}>
              <Empty height="40vh" />
              <br />
              <Typography className={classes.svgText} variant="overline">
                {Strings.noImages()}
              </Typography>
            </Grid>
          )}
        </>
      ) : (
        <Grid item className={classes.svgContainer}>
          <Void height="40vh" />
          <br />
          <Typography className={classes.svgText} variant="overline">
            {Strings.albumNotFound()}
          </Typography>
          <br />
          {history.length > 1 && (
            <BackButton color="inherit" placement="body" variant="text" />
          )}
        </Grid>
      )}
    </PageContainer>
  );
};

export default Album;
