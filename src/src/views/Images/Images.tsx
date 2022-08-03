import React, { useEffect, useRef, useState } from "react";
import Parse from "parse";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  Empty,
  FancyTitleTypography,
  PageContainer,
  useSnackbar,
  Image,
} from "../../components";
import { useGlobalLoadingContext } from "../../contexts";
import { useRandomColor } from "../../hooks";
import { Strings } from "../../resources";
import { ParseImage } from "../../types";
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
 * Page for viewing all the logged in users's images
 */
const Images = () => {
  useView("Images");
  const gotImages = useRef(false);
  const randomColor = useRandomColor();
  const { startGlobalLoader, stopGlobalLoader, globalLoading } =
    useGlobalLoadingContext();
  const [images, setImages] = useState<ParseImage[]>([]);
  const { enqueueErrorSnackbar } = useSnackbar();
  const classes = useStyles();

  useEffect(() => {
    if (!gotImages.current && !globalLoading) {
      startGlobalLoader();
      gotImages.current = true;
      ParseImage.query()
        .findAll()
        .then(async (response) => {
          if (response) {
            await Parse.Object.pinAll(response);
            setImages(response.map((image) => new ParseImage(image)));
          }
        })
        .catch((e) => {
          enqueueErrorSnackbar(Strings.getImagesError());
          gotImages.current = false;
        })
        .finally(() => {
          stopGlobalLoader();
        });
    }
  }, [
    enqueueErrorSnackbar,
    globalLoading,
    startGlobalLoader,
    stopGlobalLoader,
  ]);

  return (
    <PageContainer>
      <Grid item sm={8}>
        <FancyTitleTypography outlineColor={randomColor}>
          {Strings.pictures()}
        </FancyTitleTypography>
      </Grid>
      {images.length ? (
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
    </PageContainer>
  );
};

export default Images;
