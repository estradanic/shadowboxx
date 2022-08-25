import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  Empty,
  FancyTitleTypography,
  PageContainer,
  Image,
} from "../../components";
import { useRandomColor, useRequests } from "../../hooks";
import { Strings } from "../../resources";
import { ParseImage } from "../../types";
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
 * Page for viewing all the logged in users's images
 */
const Images = () => {
  useView("Images");
  const randomColor = useRandomColor();
  const classes = useStyles();
  const { getAllImagesFunction, getAllImagesQueryKey } = useRequests();
  const { data: images } = useQuery<ParseImage[], Error>(
    getAllImagesQueryKey(),
    () => getAllImagesFunction({ showErrorsInSnackbar: true }),
    {
      initialData: [],
      refetchInterval: 5 * 60 * 1000,
    }
  );

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
    </PageContainer>
  );
};

export default Images;
