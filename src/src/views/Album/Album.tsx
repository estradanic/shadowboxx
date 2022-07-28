import React, { useEffect, useRef, useState } from "react";
import { BackButton, PageContainer, useSnackbar } from "../../components";
import { useLocation, useParams } from "react-router-dom";
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
  const [album, setAlbum] = useState<ParseAlbum>();
  const { enqueueErrorSnackbar } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader, globalLoading } =
    useGlobalLoadingContext();
  const gotAlbum = useRef(false);
  const gotImages = useRef(false);
  const { id } = useParams<{ id: string }>();
  const classes = useStyles();
  const [images, setImages] = useState<ParseImage[]>();
  const location = useLocation<{ previousLocation?: Location }>();
  const randomColor = useRandomColor();

  useEffect(() => {
    if (!gotAlbum.current && !globalLoading) {
      if (id) {
        startGlobalLoader();
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
                  if (gotAlbum.current) {
                    stopGlobalLoader();
                  }
                });
              if (gotImages.current) {
                stopGlobalLoader();
              }
            } else {
              enqueueErrorSnackbar(Strings.albumNotFound(id));
              stopGlobalLoader();
            }
          })
          .catch((e) => {
            enqueueErrorSnackbar(e.message ?? Strings.getAlbumError());
            stopGlobalLoader();
          })
          .finally(() => {
            gotAlbum.current = true;
          });
      } else {
        enqueueErrorSnackbar(Strings.noAlbumId());
      }
    }
  }, [
    enqueueErrorSnackbar,
    globalLoading,
    id,
    startGlobalLoader,
    stopGlobalLoader,
  ]);

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
                  <Grid key={image.id} item xs={12} md={6} lg={4} xl={3}>
                    <Image
                      borderColor={randomColor}
                      src={image.mobileFile.url()}
                      alt={image.name}
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
          {!!location.state?.previousLocation && (
            <BackButton color="inherit" placement="body" variant="text" />
          )}
        </Grid>
      )}
    </PageContainer>
  );
};

export default Album;
