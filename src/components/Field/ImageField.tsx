import React, {
  useState,
  memo,
  useMemo,
  ChangeEventHandler,
  useCallback,
  useRef,
} from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import LinkIcon from "@material-ui/icons/Link";
import CheckIcon from "@material-ui/icons/Check";
import CloudIcon from "@material-ui/icons/Cloud";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Parse from "parse";
import classNames from "classnames";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { elide } from "../../utils";
import { Strings } from "../../resources";
import { ParseImage, ParsePointer } from "../../classes";
import TextField, { TextFieldProps } from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";
import { useSnackbar } from "../Snackbar/Snackbar";
import Image from "../Image/Image";
import RemoveImageDecoration from "../Image/Decoration/RemoveImageDecoration";
import CoverImageDecoration from "../Image/Decoration/CoverImageDecoration";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import { CaptionImageDecoration } from "../Image";
import DateImageDecoration from "../Image/Decoration/DateImageDecoration";
import useRandomColor from "../../hooks/useRandomColor";
import useRefState from "../../hooks/useRefState";
import { useImageContext } from "../../contexts/ImageContext";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import { useQuery } from "@tanstack/react-query";
import FilterBar, { FilterBarProps } from "../FilterBar/FilterBar";
import { useJobContext } from "../../contexts/JobContext";
import { Skeleton } from "../Skeleton";
import { LoadingWrapper } from "../Loader";
import TagsImageDecoration from "../Image/Decoration/TagsImageDecoration";

const useStyles = makeStyles((theme: Theme) => ({
  endAdornment: {
    color: theme.palette.primary.light,
    cursor: "pointer",
    marginRight: theme.spacing(2),
  },
  endAdornmentAvatar: {
    backgroundColor: theme.palette.primary.light,
    cursor: "default",
    marginRight: theme.spacing(2),
  },
  input: {
    cursor: "text",
    visibility: "hidden",
  },
  multiImageContainer: {
    textAlign: "center",
    border: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(2, 0),
    borderRadius: "4px",
    padding: theme.spacing(2),
  },
  imageWrapper: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(0, 1),
    position: "relative",
  },
  main: {
    "& > div": {
      cursor: "default",
    },
  },
  success: {
    color: theme.palette.success.main,
  },
  skeletonWrapper: {
    padding: theme.spacing(2),
  },
}));

/** Interface defining props for ImageField */
export type ImageFieldProps = Omit<
  TextFieldProps,
  "value" | "onChange" | "variant"
> & {
  /** Value of the field, array of Images */
  value: ParseImage[];
  /** Function to run when an image is added */
  onAdd: (...image: ParseImage[]) => Promise<void> | void;
  /** ACL to save new images with after upload */
  acl?: Parse.ACL;
  /** Props to pass to the IconButton when variant=="button" */
  ButtonProps?: IconButtonProps;
  /** Cover image for the album */
  coverImage?: ParsePointer<"Image">;
  /** Function to set coverImage */
  setCoverImage?: (newCoverImage: ParsePointer<"Image">) => void;
  /** Function to set caption on an image */
  setCaption?: (image: ParseImage, caption: string) => void;
  /** Function to get caption for an image */
  getCaption?: (image: ParseImage) => string;
  /** Id of the album associated with this field */
  albumId?: string;
  /** Function to run when an image is updated */
  onUpdate?: (...images: ParseImage[]) => void;
} & (
    | {
        /** Function to run when an image is removed */
        onRemove: (...images: ParseImage[]) => Promise<void> | void;
        /** Variant for how to display the field */
        variant?: "field";
        /** Whether multiple images can be selected */
        multiple: true;
        /** Props to pass down to the FilterBar component */
        filterBarProps?: FilterBarProps;
      }
    | {
        /** Function to run when an image is removed */
        onRemove?: never;
        /** Variant for how to display the field */
        variant: "field";
        /** Whether multiple images can be selected */
        multiple?: false;
        /** Props to pass down to the FilterBar component */
        filterBarProps?: never;
      }
    | {
        /** Function to run when an image is removed */
        onRemove?: never;
        /** Variant for how to display the field */
        variant: "button";
        /** Whether multiple images can be selected */
        multiple?: boolean;
        /** Props to pass down to the FilterBar component */
        filterBarProps?: never;
      }
  );

/** Component to input images from the filesystem or online */
const ImageField = memo(
  ({
    onAdd,
    onUpdate,
    onRemove,
    label,
    value = [],
    multiple = false,
    acl,
    variant = "field",
    ButtonProps = {},
    disabled,
    coverImage,
    setCoverImage,
    getCaption,
    setCaption,
    filterBarProps,
    albumId,
    ...rest
  }: ImageFieldProps) => {
    const classes = useStyles();

    const {
      promptImageSelectionDialog,
      uploadImagesFromFiles,
      uploadImageFromUrl,
    } = useImageContext();
    const { jobInfo } = useJobContext();
    const jobsForAlbum = albumId
      ? Object.values(jobInfo).filter(
          (job) => job.albumId === albumId && !!job.file
        )
      : [];
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
    const [imageUrlRef, imageUrl, setImageUrl] = useRefState("");

    const { getImageUrlFunction, getImageUrlOptions, getImageUrlQueryKey } =
      useQueryConfigs();
    const { data: mobileUrl } = useQuery<string, Error>(
      getImageUrlQueryKey(value[0]?.objectId ?? "", "mobile"),
      () => getImageUrlFunction(value[0]?.objectId ?? "", "mobile"),
      getImageUrlOptions({ enabled: !!value[0]?.objectId })
    );

    const [anchorEl, setAnchorEl] = useState<Element>();
    const closeMenu = () => setAnchorEl(undefined);

    const { enqueueErrorSnackbar } = useSnackbar();

    const randomColor = useRandomColor();

    const { openPrompt } = useActionDialogContext();

    const inputRef = useRef<HTMLInputElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);

    const selectFromLibrary = useCallback(() => {
      promptImageSelectionDialog({
        handleConfirm: async (toAdd) => await onAdd(...toAdd),
        alreadySelected: value,
        multiple,
      });
    }, [promptImageSelectionDialog, value, onAdd, multiple]);

    const addFromFile: ChangeEventHandler<HTMLInputElement> = async (event) => {
      if (event.target.files?.[0]) {
        const files = [];
        for (let i = 0; i < event.target.files.length; i++) {
          files[i] = event.target.files[i];
        }
        try {
          await uploadImagesFromFiles(files, {
            acl,
            onEachCompleted: async (image) => {
              await onAdd(image);
            },
            albumId,
          });
        } catch (error: any) {
          console.error(error);
          enqueueErrorSnackbar(Strings.error.uploadingImage());
        } finally {
          // Clear the input so that the same file can be uploaded again
          event.target.value = "";
        }
      }
    };

    const addFromUrl = async () => {
      try {
        const newImage = await uploadImageFromUrl(imageUrlRef.current, acl);
        await onAdd(newImage);
      } catch (error: any) {
        console.log(error);
        enqueueErrorSnackbar(Strings.error.uploadingImage(imageUrlRef.current));
      }
      setShowUrlInput(false);
      setImageUrl("");
    };

    const openUrlInput = () => {
      setShowUrlInput(true);
      urlInputRef.current?.focus?.();
    };

    const dialogImageUrlInputPortalNode = useMemo(
      () => createHtmlPortalNode(),
      []
    );

    return (
      <>
        {variant === "field" ? (
          <>
            <TextField // Url src input
              style={{ display: showUrlInput ? "inherit" : "none" }}
              ref={urlInputRef}
              inputRef={(input) => input && input.focus()} // Focus on mount
              fullWidth
              onChange={(event) => setImageUrl(event.target.value)}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  addFromUrl();
                }
              }}
              value={imageUrl}
              label={Strings.label.imageUrl}
              InputProps={{
                endAdornment: (
                  <>
                    <InputAdornment position="end" onClick={addFromUrl}>
                      <CheckIcon
                        className={classNames(
                          classes.endAdornment,
                          classes.success
                        )}
                      />
                    </InputAdornment>
                    <InputAdornment
                      position="end"
                      onClick={() => setShowUrlInput(false)}
                    >
                      <CloseIcon
                        color="error"
                        className={classes.endAdornment}
                      />
                    </InputAdornment>
                  </>
                ),
              }}
            />
            <TextField // Main input
              className={classes.main}
              style={{ display: showUrlInput ? "none" : "inherit" }}
              onChange={addFromFile}
              fullWidth
              inputProps={{
                accept: "image/*,video/*",
                multiple,
                className: classes.input,
                ref: inputRef,
              }}
              type="file"
              label={label}
              InputProps={{
                endAdornment: (
                  <>
                    <InputAdornment
                      disablePointerEvents={disabled}
                      onClick={openUrlInput}
                      position="end"
                    >
                      <Tooltip title={Strings.action.addFromUrl}>
                        <LinkIcon className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    <InputAdornment
                      disablePointerEvents={disabled}
                      position="end"
                      onClick={selectFromLibrary}
                    >
                      <Tooltip title={Strings.action.addFromLibrary}>
                        <CloudIcon className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    <InputAdornment
                      disablePointerEvents={disabled}
                      position="end"
                      onClick={() => {
                        inputRef.current?.click?.();
                      }}
                    >
                      <Tooltip title={Strings.action.addFromFile}>
                        <AddAPhotoIcon className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    {!!value.length && !multiple && (
                      <InputAdornment
                        disablePointerEvents={disabled}
                        position="end"
                      >
                        <Avatar
                          className={classes.endAdornmentAvatar}
                          src={mobileUrl}
                          alt={value[0].name}
                        />
                      </InputAdornment>
                    )}
                  </>
                ),
                startAdornment: !!value.length && (
                  <InputAdornment position="start">
                    <Typography variant="body1">
                      {value.length > 1 && multiple
                        ? Strings.label.multipleImages
                        : elide(value[0].name, 20, 3)}
                    </Typography>
                  </InputAdornment>
                ),
                readOnly: true,
              }}
              disabled={disabled}
              {...rest}
            />
            {multiple && (
              <Grid container className={classes.multiImageContainer}>
                {!!filterBarProps && <FilterBar {...filterBarProps!} />}
                {jobsForAlbum.map((job) => (
                  <Grid
                    key={`job-${job.id}`}
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    xl={3}
                    className={classes.imageWrapper}
                  >
                    <LoadingWrapper
                      className={classes.skeletonWrapper}
                      loading={true}
                      global={false}
                      progress={job.progress}
                      type={
                        [0, 100, undefined].includes(job.progress)
                          ? "indeterminate"
                          : "determinate"
                      }
                    >
                      <Skeleton variant="rect" width="100%" height="300px" />
                    </LoadingWrapper>
                  </Grid>
                ))}
                {value.map((image) => {
                  const imageDecorations = [
                    <RemoveImageDecoration
                      onClick={async () => {
                        await onRemove!(image);
                      }}
                    />,
                    <DateImageDecoration
                      initialDate={image.dateTaken}
                      onConfirm={async (date) => {
                        image.dateTaken = date;
                        const newImage = await image.save();
                        onUpdate?.(newImage);
                      }}
                    />,
                    <TagsImageDecoration
                      options={filterBarProps?.tagOptions ?? []}
                      initialTags={image.tags}
                      onConfirm={async (tags) => {
                        image.tags = tags;
                        const newImage = await image.save();
                        onUpdate?.(newImage);
                      }}
                      position="topCenter"
                    />,
                  ];
                  if (getCaption && setCaption) {
                    imageDecorations.push(
                      <CaptionImageDecoration
                        initialCaption={getCaption(image)}
                        onConfirm={(caption) => setCaption(image, caption)}
                      />
                    );
                  }
                  if (coverImage) {
                    const checked = coverImage.id === image.objectId;
                    imageDecorations.push(
                      <CoverImageDecoration
                        checked={checked}
                        onClick={() => {
                          if (checked) {
                            setCoverImage?.(value[0].toPointer());
                          } else {
                            setCoverImage?.(image.toPointer());
                          }
                        }}
                      />
                    );
                  }
                  return (
                    <Grid
                      xs={12}
                      md={6}
                      lg={4}
                      item
                      className={classes.imageWrapper}
                      key={image.objectId}
                    >
                      <Image
                        borderColor={randomColor}
                        parseImage={image}
                        decorations={imageDecorations}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        ) : (
          <>
            <InPortal node={dialogImageUrlInputPortalNode}>
              <TextField
                onChange={(e) => setImageUrl(e.target.value)}
                label={Strings.label.imageUrl}
                value={imageUrl}
              />
            </InPortal>
            <input
              type="file"
              style={{ display: "none" }}
              onChange={addFromFile}
              accept="image/*,video/*"
              multiple={multiple}
              ref={inputRef}
            />
            <Menu
              open={!!anchorEl}
              anchorEl={anchorEl}
              onClose={closeMenu}
              onClick={closeMenu}
              keepMounted
            >
              <MenuItem onClick={selectFromLibrary}>
                {Strings.action.addFromLibrary}
              </MenuItem>
              <MenuItem onClick={() => inputRef.current?.click?.()}>
                {Strings.action.addFromFile}
              </MenuItem>
              <MenuItem
                onClick={() =>
                  openPrompt(
                    dialogImageUrlInputPortalNode,
                    addFromUrl,
                    undefined,
                    {
                      title: Strings.action.addFromUrl,
                      confirmButtonColor: "success",
                    }
                  )
                }
              >
                {Strings.action.addFromUrl}
              </MenuItem>
            </Menu>
            <IconButton
              name="add-photo"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              {...ButtonProps}
            >
              <AddAPhotoIcon className={classes.endAdornment} />
            </IconButton>
          </>
        )}
      </>
    );
  }
);

export default ImageField;
