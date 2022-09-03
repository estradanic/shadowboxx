import React, { memo } from "react";
import {
  BackButton,
  FancyTitleTypographySkeleton,
  ImagesSkeleton,
  PageContainer,
} from "../../components";
import { useLocation, useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import { ParseImage, ParseAlbum } from "../../types";
import { FancyTitleTypography, Void, Images } from "../../components";
import { useRandomColor, useQueryConfigs } from "../../hooks";
import { useView } from "../View";

const useStyles = makeStyles(() => ({
  svgContainer: {
    textAlign: "center",
  },
  svgText: {
    fontSize: "medium",
  },
}));

/**
 * Page for viewing an album
 */
const Album = memo(() => {
  useView("Album");
  const { id } = useParams<{ id: string }>();
  const classes = useStyles();
  const location = useLocation() as { state: { previousLocation?: Location } };
  const randomColor = useRandomColor();
  const {
    getAlbumFunction,
    getAlbumQueryKey,
    getAlbumOptions,
    getImagesByIdFunction,
    getImagesByIdQueryKey,
    getImagesByIdOptions,
  } = useQueryConfigs();
  const { data: album, status: albumStatus } = useQuery<ParseAlbum, Error>(
    getAlbumQueryKey(id),
    () => getAlbumFunction(id, { showErrorsInSnackbar: true }),
    getAlbumOptions()
  );
  const { data: images, status: imagesStatus } = useQuery<ParseImage[], Error>(
    getImagesByIdQueryKey(album?.images ?? []),
    () =>
      getImagesByIdFunction(album?.images ?? [], {
        showErrorsInSnackbar: true,
      }),
    getImagesByIdOptions({ enabled: !!album?.images })
  );

  return (
    <PageContainer>
      {albumStatus === "loading" ? (
        <>
          <FancyTitleTypographySkeleton outlineColor={randomColor} />
          <ImagesSkeleton />
        </>
      ) : albumStatus === "success" && album ? (
        <>
          <Grid item sm={8}>
            <FancyTitleTypography outlineColor={randomColor}>
              {album.name}
            </FancyTitleTypography>
          </Grid>
          <Images
            status={imagesStatus}
            images={images}
            outlineColor={randomColor}
          />
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
});

export default Album;
