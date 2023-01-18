import React, { memo, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import {
  FancyTitleTypography,
  PageContainer,
  Images,
  Fab,
  useImageStyles,
  useSnackbar,
  Button,
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
import {
  ImageContextProvider,
  useImageContext,
  useNetworkDetectionContext,
} from "../../contexts";
import useFlatInfiniteQueryData from "../../hooks/Query/useFlatInfiniteQueryData";
import { Online } from "react-detect-offline";
import { useCallback } from "react";
import classNames from "classnames";
import { ImageProps } from "../../components/Image/Image";
import { SnackbarKey } from "notistack";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useActionDialogContext } from "../../components/Dialog/ActionDialog";

const useStyles = makeStyles((theme: Theme) => ({
  actionContainer: {
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(4),
    padding: theme.spacing(0.5, 1),
    marginBottom: theme.spacing(-5),
    borderRadius: theme.spacing(0.5),
  },
}));

type ActionBarProps = {
  selectedImages: string[];
  onDelete: () => Promise<void>;
  images: ParseImage[];
};

const ActionBar = ({ selectedImages, images, onDelete }: ActionBarProps) => {
  const classes = useStyles();
  const { deleteImage } = useImageContext();
  const { openConfirm } = useActionDialogContext();
  const { enqueueInfoSnackbar } = useSnackbar();
  return (
    <Grid item sm={6} className={classes.actionContainer}>
      <Button
        variant="text"
        color="error"
        disabled={selectedImages.length === 0}
        onClick={() => {
          openConfirm(
            Strings.deleteImagesConfirm(),
            async () => {
              const imagesToDelete = images.filter((image) =>
                selectedImages.includes(image.id)
              );
              await Promise.all(
                imagesToDelete.map((image) => deleteImage(image))
              );
              await onDelete();
            },
            () => {},
            {
              confirmButtonText: Strings.delete(),
              confirmButtonColor: "error",
            }
          );
        }}
      >
        <DeleteIcon fontSize="small" />
        {Strings.delete()}
      </Button>
      <Button
        variant="text"
        color="success"
        disabled={selectedImages.length === 0}
        onClick={() => enqueueInfoSnackbar("Feature coming soon!")}
      >
        <AddIcon fontSize="small" />
        {Strings.addToAlbum()}
      </Button>
    </Grid>
  );
};

/**
 * Page for viewing all the logged in users's images
 */
const Pictures = memo(() => {
  useView("Pictures");
  const imageClasses = useImageStyles();
  const [editMode, setEditMode] = useState<boolean>(false);
  const randomColor = useRandomColor();
  const { online } = useNetworkDetectionContext();
  const {
    getAllImagesInfiniteFunction,
    getAllImagesInfiniteQueryKey,
    getAllImagesInfiniteOptions,
  } = useInfiniteQueryConfigs();
  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery<ParseImage[], Error>(
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
  const images = useFlatInfiniteQueryData(data);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { enqueueWarningSnackbar, closeSnackbar } = useSnackbar();
  const [snackbarKey, setSnackbarKey] = useState<SnackbarKey | undefined>();

  useEffect(() => {
    if (!online) {
      closeSnackbar(snackbarKey);
      setEditMode(false);
    }
  }, [online, setEditMode, closeSnackbar, snackbarKey]);

  const getImageProps = useCallback(
    async (image: ParseImage): Promise<Partial<ImageProps>> => ({
      className: classNames({
        [imageClasses.selected]: editMode && selectedImages.includes(image.id),
        [imageClasses.unselected]:
          editMode && !selectedImages.includes(image.id),
      }),
      showFullResolutionOnClick: !editMode,
      onClick: editMode
        ? () => {
            setSelectedImages((prev) => {
              if (prev.includes(image.id)) {
                return prev.filter((id) => id !== image.id);
              }
              return [...prev, image.id];
            });
          }
        : undefined,
    }),
    [
      selectedImages,
      setSelectedImages,
      editMode,
      imageClasses.selected,
      imageClasses.unselected,
    ]
  );

  const onDelete = async () => {
    setSelectedImages([]);
    setEditMode(false);
    await refetch();
  };

  return (
    <PageContainer>
      <Grid item sm={8}>
        <FancyTitleTypography outlineColor={randomColor}>
          {Strings.pictures()}
        </FancyTitleTypography>
      </Grid>
      {editMode && (
        <ImageContextProvider>
          <ActionBar
            selectedImages={selectedImages}
            images={images}
            onDelete={onDelete}
          />
        </ImageContextProvider>
      )}
      <Images
        status={isRefetching ? "refetching" : status}
        images={images}
        outlineColor={randomColor}
        getImageProps={getImageProps}
      />
      <Online>
        <Fab
          onClick={() => {
            if (!editMode) {
              setSnackbarKey(
                enqueueWarningSnackbar(Strings.enteringEditMode(), {
                  persist: true,
                })
              );
            } else {
              closeSnackbar(snackbarKey);
            }
            setEditMode((prev) => !prev);
          }}
          color={editMode ? "error" : "success"}
        >
          {editMode ? <CloseIcon /> : <EditIcon />}
        </Fab>
      </Online>
    </PageContainer>
  );
});

export default Pictures;
