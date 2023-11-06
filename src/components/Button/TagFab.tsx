import React, { useMemo, useCallback, useState, KeyboardEvent } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CloseIcon from "@material-ui/icons/Close";
import StyleIcon from "@material-ui/icons/Style";
import { ParseImage } from "../../classes";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { dedupe } from "../../utils";
import useRefState from "../../hooks/useRefState";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalLoadingStore } from "../../stores";
import { Strings } from "../../resources";
import { useSnackbar } from "../Snackbar/Snackbar";
import FancyTypography from "../Typography/FancyTypography";
import QueryCacheGroups from "../../hooks/Query/QueryCacheGroups";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import TextField from "../Field/TextField";
import IconButton from "../Button/IconButton";
import Fab from "./Fab";
import Tag from "../Tag/Tag";

const useStyles = makeStyles((theme: Theme) => ({
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
    },
  },
}));

interface TagFabProps {
  /** Images to tag */
  imagesToTag: ParseImage[];
}

/** Floatin action button to tag multiple images */
const TagFab = ({ imagesToTag }: TagFabProps) => {
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
  const { startGlobalLoader, stopGlobalLoader, updateGlobalLoader } =
    useGlobalLoadingStore((store) => ({
      startGlobalLoader: store.startGlobalLoader,
      stopGlobalLoader: store.stopGlobalLoader,
      updateGlobalLoader: store.updateGlobalLoader,
    }));
  const { enqueueErrorSnackbar } = useSnackbar();

  const handleConfirm = useCallback(async () => {
    startGlobalLoader({
      type: "determinate",
      progress: 0,
      content: (
        <FancyTypography variant="loading">
          {Strings.message.taggingMemories}
        </FancyTypography>
      ),
    });
    const increment = 100 / imagesToTag.length;
    let progress = 0;
    try {
      await Promise.all(
        imagesToTag.map(async (image) => {
          image.tags = tagsRef.current;
          await image.save();
          progress += increment;
          updateGlobalLoader({ progress });
        })
      );
    } catch {
      enqueueErrorSnackbar(Strings.error.taggingMemories);
    } finally {
      stopGlobalLoader();
      queryClient.invalidateQueries(getAllTagsQueryKey());
      queryClient.invalidateQueries([QueryCacheGroups.GET_TAGS_BY_IMAGE_ID]);
    }
  }, [
    imagesToTag,
    startGlobalLoader,
    stopGlobalLoader,
    queryClient,
    updateGlobalLoader,
    getAllTagsQueryKey,
    tagsRef,
  ]);

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

  const { openPrompt } = useActionDialogContext();

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

export default TagFab;
