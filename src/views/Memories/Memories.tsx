import React, { memo, useEffect, useState, useCallback, useMemo, KeyboardEvent } from "react";
import classNames from "classnames";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import StyleIcon from "@material-ui/icons/Style";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { SnackbarKey } from "notistack";
import {
  FancyTitleTypography,
  PageContainer,
  Images,
  Fab,
  useImageStyles,
  useSnackbar,
  Online,
  useActionDialogContext,
  TextField,
  IconButton,
  FancyTypography,
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
import TagsImageDecoration from "../../components/Image/Decoration/TagsImageDecoration";
import DateImageDecoration from "../../components/Image/Decoration/DateImageDecoration";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import { useGlobalLoadingStore } from "../../stores";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { dedupe } from "../../utils";
import useRefState from "../../hooks/useRefState";
import QueryCacheGroups from "../../hooks/Query/QueryCacheGroups";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Tag from "../../components/Tag/Tag";

const useStyles = makeStyles((theme: Theme) => ({
  deleteFab: {
    transform: `translateX(calc(-100% - ${theme.spacing(1)}px))`,
    backgroundColor: theme.palette.error.contrastText,
    color: theme.palette.error.main,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.error.contrastText,
      color: theme.palette.error.dark,
    },
    "&[disabled]": {
      backgroundColor: theme.palette.error.contrastText,
      color: theme.palette.error.dark,
      opacity: 0.25,
      cursor: "default",
    }
  },
  tagFab: {
    transform: `translateX(calc(-200% - ${theme.spacing(2)}px))`,
    backgroundColor: theme.palette.primary.contrastText,
    color: theme.palette.primary.main,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.primary.contrastText,
      color: theme.palette.primary.dark,
    },
    "&[disabled]": {
      backgroundColor: theme.palette.primary.contrastText,
      color: theme.palette.primary.dark,
      opacity: 0.25,
      cursor: "default",
    }
  }
}));

interface TagFabProps {
  imagesToTag: ParseImage[],
}

const TagFab = ({imagesToTag}: TagFabProps) => {
  const classes = useStyles();
  const tagsPortalNode = useMemo(() => createHtmlPortalNode(), []);
  const initialTags = useMemo(() => {
    const tags: string[] = [];
    imagesToTag.forEach((image) => {
      if (image.tags) {
        tags.push(...image.tags);
      }
    });
    return dedupe(tags);
  }, [imagesToTag]);
  const [tagsRef, tags, setTags] = useRefState(initialTags);
  const { getAllTagsFunction, getAllTagsQueryKey, getAllTagsOptions } =
    useQueryConfigs();
  const { data: allTags } = useQuery<string[], Error>(
    getAllTagsQueryKey(),
    getAllTagsFunction,
    getAllTagsOptions()
  );
  const queryClient = useQueryClient();
  const {startGlobalLoader, stopGlobalLoader, updateGlobalLoader} = useGlobalLoadingStore((store) => ({
    startGlobalLoader: store.startGlobalLoader,
    stopGlobalLoader: store.stopGlobalLoader,
    updateGlobalLoader: store.updateGlobalLoader,
  }));
  const {enqueueErrorSnackbar} = useSnackbar();

  const handleConfirm = useCallback(async () => {
    startGlobalLoader({type: "determinate", progress: 0, content: <FancyTypography variant="loading">{Strings.message.taggingMemories}</FancyTypography>});
    const increment = 100 / imagesToTag.length;
    let progress = 0;
    try {
      await Promise.all(imagesToTag.map(async (image) => {
        image.tags = tagsRef.current;
        await image.save();
        progress += increment;
        updateGlobalLoader({progress});
      }));
    } catch {
      enqueueErrorSnackbar(Strings.error.taggingMemories)
    } finally {
      stopGlobalLoader();
      queryClient.invalidateQueries(getAllTagsQueryKey());
      queryClient.invalidateQueries([QueryCacheGroups.GET_TAGS_BY_IMAGE_ID]);
    }
  }, [imagesToTag, startGlobalLoader, stopGlobalLoader, queryClient, updateGlobalLoader, getAllTagsQueryKey, tagsRef]);

  const handleCancel = useCallback(() => {
    setTags(initialTags);
  }, [initialTags, setTags]);

  const [inputValue, setInputValue] = useState("");

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
      case ",":
      case "Tab": {
        if (inputValue.length > 0) {
          setTags(tags.concat([inputValue]));
          setInputValue("");
        }
        if (event.key !== "Tab") {
          event.preventDefault();
        }
        break;
      }
      default:
    }
  };

  const {openPrompt} = useActionDialogContext();

  return (
    <>
      <InPortal node={tagsPortalNode}>
        <Autocomplete<string, true, false, true>
          options={dedupe(allTags ?? [])}
          value={tags}
          fullWidth
          multiple
          freeSolo
          inputValue={inputValue}
          filterSelectedOptions
          disableCloseOnSelect
          onInputChange={(_, newInputValue) => {
            if (newInputValue.endsWith(" ") || newInputValue.endsWith(",")) {
              setTags(
                tags.concat([
                  newInputValue.substring(0, newInputValue.length - 1),
                ])
              );
              setInputValue("");
            } else {
              setInputValue(newInputValue);
            }
          }}
          onChange={(_, newTags) => {
            setTags(newTags);
          }}
          renderInput={(props) => (
            <TextField
              {...props}
              InputProps={{
                ...props.InputProps,
                endAdornment: !!tags.length && (
                  <IconButton
                    contrastText={false}
                    color="error"
                    onClick={() => setTags([])}
                  >
                    <CloseIcon />
                  </IconButton>
                ),
              }}
              label={Strings.label.tags}
              onKeyDown={onKeyDown}
              onBlur={() => {
                if (inputValue.length > 0) {
                  setTags(tags.concat([inputValue]));
                  setInputValue("");
                }
              }}
            />
          )}
          renderTags={(value, getTagProps) => {
            return value.map((option, index) => (
              <Tag label={option} {...getTagProps({ index })} key={option} />
            ));
          }}
        />
      </InPortal>
      <Fab
        className={classes.tagFab}
        onClick={() => {
          openPrompt(tagsPortalNode, handleConfirm, handleCancel, {
            title: Strings.action.addOrRemoveTags,
            confirmButtonColor: "success",
          });
        }}
        disabled={imagesToTag.length === 0}
      >
        <StyleIcon />
      </Fab>
    </>
  );
};

interface DeleteFabProps {
  imagesToDelete: ParseImage[];
  onDelete: () => Promise<void>;
}

const DeleteFab = ({imagesToDelete, onDelete}: DeleteFabProps) => {
  const classes = useStyles();
  const {deleteImage} = useImageContext();
  const {openConfirm} = useActionDialogContext();
  const {startGlobalLoader, stopGlobalLoader, updateGlobalLoader} = useGlobalLoadingStore((store) => ({
    startGlobalLoader: store.startGlobalLoader,
    stopGlobalLoader: store.stopGlobalLoader,
    updateGlobalLoader: store.updateGlobalLoader,
  }));
  const {enqueueErrorSnackbar} = useSnackbar();
  return (
    <Fab
      className={classes.deleteFab}
      onClick={() => {
        openConfirm(
          Strings.message.deleteImagesConfirm,
          async () => {
            startGlobalLoader({
              type: "determinate",
              progress: 0,
              content: <FancyTypography variant="loading">{Strings.message.deletingMemories}</FancyTypography>,
            });
            const increment = 100 / imagesToDelete.length;
            let progress = 0;
            try {
              await Promise.all(
                imagesToDelete.map(async (image) => {
                  await deleteImage(image);
                  progress += increment;
                  updateGlobalLoader({progress});
                })
              );
            } catch {
              enqueueErrorSnackbar(Strings.error.deletingMemories);
            } finally {
              await onDelete();
              stopGlobalLoader();
            }
          },
          () => {},
          {
            confirmButtonText: Strings.action.delete,
            confirmButtonColor: "error",
          }
        );
      }}
      disabled={imagesToDelete.length === 0}
    >
      <DeleteIcon />
    </Fab>
  );
}

/**
 * Page for viewing all the logged in users's images/videos
 */
const Memories = memo(() => {
  useView("Memories");
  const imageClasses = useImageStyles();
  const [editMode, setEditMode] = useState<boolean>(false);
  const randomColor = useRandomColor();
  const { online } = useNetworkDetectionContext();
  const { sortDirection, tagSearch, ...restFilterBarProps } = useFilterBar();
  const {
    getAllImagesInfiniteFunction,
    getAllImagesInfiniteQueryKey,
    getAllImagesInfiniteOptions,
  } = useInfiniteQueryConfigs();
  const { getAllTagsFunction, getAllTagsQueryKey, getAllTagsOptions } =
    useQueryConfigs();
  const { data: allTags } = useQuery<string[], Error>(
    getAllTagsQueryKey(),
    getAllTagsFunction,
    getAllTagsOptions()
  );
  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery<ParseImage[], Error>(
    getAllImagesInfiniteQueryKey({ sortDirection, tagSearch }),
    ({ pageParam: page = 0 }) =>
      getAllImagesInfiniteFunction(
        online,
        { sortDirection, tagSearch },
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

  const getImageDecorations = useCallback(
    (image: ParseImage) => {
      if (editMode) {
        return [
          <TagsImageDecoration
            options={allTags}
            initialTags={image.tags}
            onConfirm={async (tags) => {
              image.tags = tags;
              await image.save();
            }}
          />,
          <DateImageDecoration
            position="topLeft"
            initialDate={image.dateTaken}
            onConfirm={async (date) => {
              image.dateTaken = date;
              await image.save();
            }}
          />,
        ];
      }
      return [];
    },
    [editMode, allTags]
  );

  const getImageProps = useCallback(
    async (image: ParseImage): Promise<Partial<ImageProps>> => ({
      className: classNames({
        [imageClasses.selected]:
          editMode && selectedImages.includes(image.objectId),
        [imageClasses.unselected]:
          editMode && !selectedImages.includes(image.objectId),
      }),
      showFullResolutionOnClick: !editMode,
      decorations: getImageDecorations(image),
      onClick: editMode
        ? () => {
            setSelectedImages((prev) => {
              if (prev.includes(image.objectId)) {
                return prev.filter((id) => id !== image.objectId);
              }
              return [...prev, image.objectId];
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
      getImageDecorations,
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
      <Images
        filterBar={
          <FilterBar
            showCaptionSearch={false}
            {...restFilterBarProps}
            sortDirection={sortDirection}
            tagSearch={tagSearch}
            tagOptions={allTags}
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
              setSelectedImages([]);
            }
            setEditMode((prev) => !prev);
          }}
          color={editMode ? "error" : "success"}
        >
          {editMode ? <CloseIcon /> : <EditIcon />}
        </Fab>
        {editMode &&
          <>
            <ImageContextProvider>
              <DeleteFab imagesToDelete={images.filter((image) => selectedImages.includes(image.objectId))} onDelete={onDelete} />
            </ImageContextProvider>
            <TagFab imagesToTag={images.filter((image) => selectedImages.includes(image.objectId))} />
          </>
        }
      </Online>
    </PageContainer>
  );
});

export default Memories;
