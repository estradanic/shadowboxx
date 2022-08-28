import React from "react";
import { BackButton, PageContainer } from "../../components";
import { useLocation, useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Strings } from "../../resources";
import { ParseImage, ParseAlbum } from "../../types";
import { Empty, Image, FancyTitleTypography, Void } from "../../components";
import { useRandomColor, useRequests } from "../../hooks";
import { useView } from "../View";
import { useQuery } from "@tanstack/react-query";

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
  } = useRequests();
  const { data: album } = useQuery<ParseAlbum, Error>(
    getAlbumQueryKey(id),
    () => getAlbumFunction(id, { showErrorsInSnackbar: true }),
    getAlbumOptions()
  );
  const { data: images } = useQuery<ParseImage[], Error>(
    getImagesByIdQueryKey(album?.images ?? []),
    () =>
      getImagesByIdFunction(album?.images ?? [], {
        showErrorsInSnackbar: true,
      }),
    getImagesByIdOptions()
  );

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
                      fullResolutionSrc={image.file.url()}
                      showFullResolutionOnClick
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
