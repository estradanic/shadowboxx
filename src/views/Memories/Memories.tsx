import React, { memo, useEffect, useState, useCallback } from "react";
import classNames from "classnames";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SnackbarKey } from "notistack";
import {
  FancyTitleTypography,
  PageContainer,
  Images,
  Fab,
  useImageStyles,
  useSnackbar,
  Button,
  Online,
  useActionDialogContext,
} from "../../components";
import { Strings } from "../../resources";
import { ParseImage } from "../../classes";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { useView } from "../View";
import { ImageProps } from "../../components/Image/Image";
import useFlatInfiniteQueryData from "../../hooks/Query/useFlatInfiniteQueryData";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import useInfiniteQueryConfigs from "../../hooks/Query/useInfiniteQueryConfigs";
import useRandomColor from "../../hooks/useRandomColor";
import {
  ImageContextProvider,
  useImageContext,
} from "../../contexts/ImageContext";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import useFilterBar from "../../components/FilterBar/useFilterBar";
import FilterBar from "../../components/FilterBar/FilterBar";

const useStyles = makeStyles((theme: Theme) => ({
  actionContainer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.5, 1),
    borderRadius: "4px",
    position: "absolute",
    bottom: theme.spacing(7),
    zIndex: theme.zIndex.modal,
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
            Strings.message.deleteImagesConfirm,
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
              confirmButtonText: Strings.action.delete,
              confirmButtonColor: "error",
            }
          );
        }}
      >
        <DeleteIcon fontSize="small" />
        {Strings.action.delete}
      </Button>
      <Button
        variant="text"
        color="success"
        disabled={selectedImages.length === 0}
        onClick={() => enqueueInfoSnackbar("Feature coming soon!")}
      >
        <AddIcon fontSize="small" />
        {Strings.action.addToAlbum}
      </Button>
    </Grid>
  );
};

/**
 * Page for viewing all the logged in users's images
 */
const Memories = memo(() => {
  useView("Memories");
  const imageClasses = useImageStyles();
  const [editMode, setEditMode] = useState<boolean>(false);
  const randomColor = useRandomColor();
  const { online } = useNetworkDetectionContext();
  const { sortDirection, ...restFilterBarProps } = useFilterBar();
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
    getAllImagesInfiniteQueryKey({ sortDirection }),
    ({ pageParam: page = 0 }) =>
      getAllImagesInfiniteFunction(
        online,
        { sortDirection },
        {
          showErrorsInSnackbar: true,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        }
      ),
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
    closeSnackbar(snackbarKey);
    await refetch();
  };

  return (
    <PageContainer>
      <Grid item sm={8}>
        <FancyTitleTypography outlineColor={randomColor}>
          {Strings.label.memories}
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
        filterBar={
          <FilterBar
            showCaptionSearch={false}
            {...restFilterBarProps}
            sortDirection={sortDirection}
          />
        }
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
                enqueueWarningSnackbar(Strings.label.editMode, {
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

export default Memories;
