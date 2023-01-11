import React, { memo, useCallback, useMemo, useState } from "react";
import {
  AlbumFormDialog,
  BackButton,
  FancyTitleTypographySkeleton,
  ImagesSkeleton,
  PageContainer,
  useSnackbar,
} from "../../components";
import { useLocation, useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Strings } from "../../resources";
import { ParseImage, ParseAlbum } from "../../classes";
import { FancyTitleTypography, Void, Images } from "../../components";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import {
  useRandomColor,
  useQueryConfigs,
  useInfiniteQueryConfigs,
  useInfiniteScroll,
  useHideOnScroll,
} from "../../hooks";
import { useView } from "../View";
import OwnerImageDecoration from "../../components/Image/Decoration/OwnerImageDecoration";
import { Fab } from "@material-ui/core";
import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    position: "absolute",
    right: theme.spacing(4),
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.success.dark,
    },
    transition: theme.transitions.create("bottom"),
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  fabVisible: {
    bottom: theme.spacing(7),
  },
  fabHidden: {
    bottom: theme.spacing(-10),
  },
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
  const queryClient = useQueryClient();
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
  const [editMode, setEditMode] = useState<boolean>(false);
  const fabVisible = useHideOnScroll();
  const { enqueueSuccessSnackbar, enqueueErrorSnackbar } = useSnackbar();

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

  const getImageCaption = useCallback(
    async (image: ParseImage) => {
      return album?.captions?.[image.id!] ?? "";
    },
    [album?.captions]
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
                const newAlbum = await album.update(attributes, changes);
                queryClient.setQueryData(getAlbumQueryKey(id), newAlbum);
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
            getDecorations={getImageDecorations}
            getCaption={getImageCaption}
            status={imagesStatus}
            images={images}
            outlineColor={randomColor}
          />
          <Fab
            onClick={() => setEditMode(true)}
            className={classNames(classes.fab, {
              [classes.fabVisible]: fabVisible,
              [classes.fabHidden]: !fabVisible,
            })}
          >
            <EditIcon />
          </Fab>
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
