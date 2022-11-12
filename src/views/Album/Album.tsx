import React, { memo, useCallback, useMemo } from "react";
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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import { ParseImage, ParseAlbum } from "../../classes";
import { FancyTitleTypography, Void, Images } from "../../components";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import {
  useRandomColor,
  useQueryConfigs,
  useInfiniteQueryConfigs,
  useInfiniteScroll,
} from "../../hooks";
import { useView } from "../View";
import OwnerImageDecoration from "../../components/Image/Decoration/OwnerImageDecoration";

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
  const { getAlbumFunction, getAlbumQueryKey, getAlbumOptions } =
    useQueryConfigs();
  const {
    getImagesByIdInfiniteFunction,
    getImagesByIdInfiniteQueryKey,
    getImagesByIdInfiniteOptions,
  } = useInfiniteQueryConfigs();
  const { data: album, status: albumStatus } = useQuery<ParseAlbum, Error>(
    getAlbumQueryKey(id),
    () => getAlbumFunction(id, { showErrorsInSnackbar: true }),
    getAlbumOptions()
  );
  const {
    data,
    status: imagesStatus,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ParseImage[], Error>(
    getImagesByIdInfiniteQueryKey(album?.images ?? []),
    ({ pageParam: page = 0 }) =>
      getImagesByIdInfiniteFunction(album?.images ?? [], {
        showErrorsInSnackbar: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    getImagesByIdInfiniteOptions({ enabled: !!album?.images })
  );
  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });

  const images = useMemo(
    () => data?.pages?.flatMap((page) => page),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.pages?.length]
  );

  const getImageDecorations = useCallback(async (image: ParseImage) => {
    return [
      <OwnerImageDecoration
        UserAvatarProps={{
          UseUserInfoParams: { userPointer: image.owner },
        }}
      />,
    ];
  }, []);

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
            getDecorations={getImageDecorations}
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
