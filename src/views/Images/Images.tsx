import React, { memo, useMemo } from "react";
import Grid from "@material-ui/core/Grid";
import {
  FancyTitleTypography,
  PageContainer,
  Images as ImagesComponent,
} from "../../components";
import {
  useRandomColor,
  useInfiniteQueryConfigs,
  useInfiniteScroll,
} from "../../hooks";
import { Strings } from "../../resources";
import { ParseImage } from "../../classes";
import { useView } from "../View";
import { useInfiniteQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { useNetworkDetectionContext } from "../../contexts";

/**
 * Page for viewing all the logged in users's images
 */
const Images = memo(() => {
  useView("Images");
  const randomColor = useRandomColor();
  const { online } = useNetworkDetectionContext();
  const {
    getAllImagesInfiniteFunction,
    getAllImagesInfiniteQueryKey,
    getAllImagesInfiniteOptions,
  } = useInfiniteQueryConfigs();
  const { data, status, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<
    ParseImage[],
    Error
  >(
    getAllImagesInfiniteQueryKey(),
    ({ pageParam: page = 0 }) =>
      getAllImagesInfiniteFunction(online, {
        showErrorsInSnackbar: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    getAllImagesInfiniteOptions()
  );
  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });
  const images = useMemo(
    () => data?.pages?.flatMap((page) => page),
    [data?.pages]
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
