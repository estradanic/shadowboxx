import React, { memo } from "react";
import Grid from "@material-ui/core/Grid";
import {
  FancyTitleTypography,
  PageContainer,
  Images as ImagesComponent,
} from "../../components";
import { useRandomColor, useRequests } from "../../hooks";
import { Strings } from "../../resources";
import { ParseImage } from "../../types";
import { useView } from "../View";
import { useQuery } from "@tanstack/react-query";

/**
 * Page for viewing all the logged in users's images
 */
const Images = memo(() => {
  useView("Images");
  const randomColor = useRandomColor();
  const { getAllImagesFunction, getAllImagesQueryKey, getAllImagesOptions } =
    useRequests();
  const { data: images, status } = useQuery<ParseImage[], Error>(
    getAllImagesQueryKey(),
    () => getAllImagesFunction({ showErrorsInSnackbar: true }),
    getAllImagesOptions()
  );

  return (
    <PageContainer>
      <Grid item sm={8}>
        <FancyTitleTypography outlineColor={randomColor}>
          {Strings.pictures()}
        </FancyTitleTypography>
      </Grid>
      <ImagesComponent
        status={status}
        images={images}
        outlineColor={randomColor}
      />
    </PageContainer>
  );
});

export default Images;
