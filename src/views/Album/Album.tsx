import React, { memo, useCallback, useState } from "react";
import {
  AlbumFormDialog,
  BackButton,
  FancyTitleTypographySkeleton,
  ImagesSkeleton,
  PageContainer,
  Fab,
  useSnackbar,
  Online,
} from "../../components";
import { useLocation, useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
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
import { useNetworkDetectionContext } from "../../contexts";
import useFlatInfiniteQueryData from "../../hooks/Query/useFlatInfiniteQueryData";

const useStyles = makeStyles((theme: Theme) => ({
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
  const { online } = useNetworkDetectionContext();
  const { getAlbumFunction, getAlbumQueryKey, getAlbumOptions } =
    useQueryConfigs();
  const {
    getImagesByIdInfiniteFunction,
    getImagesByIdInfiniteQueryKey,
    getImagesByIdInfiniteOptions,
  } = useInfiniteQueryConfigs();
  const { data: album, status: albumStatus } = useQuery<ParseAlbum, Error>(
    getAlbumQueryKey(id),
    () => getAlbumFunction(online, id, { showErrorsInSnackbar: true }),
    getAlbumOptions()
  );
  const {
    data,
    status: imagesStatus,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery<ParseImage[], Error>(
    getImagesByIdInfiniteQueryKey(album?.images ?? []),
    ({ pageParam: page = 0 }) =>
      getImagesByIdInfiniteFunction(online, album?.images ?? [], {
        showErrorsInSnackbar: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    getImagesByIdInfiniteOptions({ enabled: !!album?.images })
  );
  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });
  const [editMode, setEditMode] = useState<boolean>(false);
  const { enqueueSuccessSnackbar, enqueueErrorSnackbar } = useSnackbar();

  const images = useFlatInfiniteQueryData(data);

  const getImageDecorations = useCallback(async (image: ParseImage) => {
    return [
      <OwnerImageDecoration
        UserAvatarProps={{
          UseUserInfoParams: { userPointer: image.owner },
        }}
      />,
    ];
  }, []);

  const getImageCaption = useCallback(
    async (image: ParseImage) => {
      return album?.captions?.[image.id] ?? "";
    },
    [album?.captions]
  );

  const getImageProps = useCallback(
    async (image: ParseImage) => {
      const decorations = await getImageDecorations(image);
      const caption = await getImageCaption(image);
      return {
        decorations,
        caption,
      };
    },
    [getImageDecorations, getImageCaption]
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
          <AlbumFormDialog
            resetOnConfirm
            value={album.attributes}
            open={editMode}
            handleCancel={() => setEditMode(false)}
            handleConfirm={async (attributes, changes) => {
              setEditMode(false);
              try {
                await album.update(attributes, changes);
                await refetch();
                enqueueSuccessSnackbar(Strings.commonSaved());
              } catch (error: any) {
                enqueueErrorSnackbar(
                  error?.message ?? Strings.editAlbumError()
                );
              }
            }}
          />
          <Grid item sm={8}>
            <FancyTitleTypography outlineColor={randomColor}>
              {album.name}
            </FancyTitleTypography>
          </Grid>
          <Images
            getImageProps={getImageProps}
            status={isRefetching ? "refetching" : imagesStatus}
            images={images}
            outlineColor={randomColor}
          />
          <Online>
            <Fab onClick={() => setEditMode(true)}>
              <EditIcon />
            </Fab>
          </Online>
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
