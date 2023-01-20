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
import { useRandomColor, useRefState, useVirtualList } from "../../hooks";
import TextField, { TextFieldProps } from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";
import { useSnackbar } from "../Snackbar/Snackbar";
import { useImageContext } from "../../contexts";
import Image from "../Image/Image";
import RemoveImageDecoration from "../Image/Decoration/RemoveImageDecoration";
import CoverImageDecoration from "../Image/Decoration/CoverImageDecoration";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import { CaptionImageDecoration } from "../Image";

const useStyles = makeStyles((theme: Theme) => ({
  endAdornment: {
    color: theme.palette.primary.light,
    cursor: "pointer",
  },
  endAdornmentAvatar: {
    backgroundColor: theme.palette.primary.light,
    cursor: "default",
  },
  input: {
    cursor: "text",
    visibility: "hidden",
  },
  multiImageContainer: {
    textAlign: "center",
    border: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(2, 0),
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(2),
  },
  imageWrapper: {
    marginBottom: theme.spacing(2),
  },
  main: {
    "& > div": {
      cursor: "default",
    },
  },
  success: {
    color: theme.palette.success.main,
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
} & (
    | {
        /** Function to run when an image is removed */
        onRemove: (...image: ParseImage[]) => Promise<void> | void;
        /** Variant for how to display the field */
        variant?: "field";
        /** Whether multiple images can be selected or not */
        multiple: true;
      }
    | {
        /** Function to run when an image is removed */
        onRemove?: never;
        /** Variant for how to display the field */
        variant: "field";
        /** Whether multiple images can be selected or not */
        multiple?: false;
      }
    | {
        /** Function to run when an image is removed */
        onRemove?: never;
        /** Variant for how to display the field */
        variant: "button";
        /** Whether multiple images can be selected or not */
        multiple?: boolean;
      }
  );

/** Component to input images from the filesystem or online */
const ImageField = memo(
  ({
    onAdd,
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
    ...rest
  }: ImageFieldProps) => {
    const classes = useStyles();

    const {
      promptImageSelectionDialog,
      uploadImagesFromFiles,
      uploadImageFromUrl,
    } = useImageContext();
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
    const [imageUrlRef, imageUrl, setImageUrl] = useRefState("");

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
          const newImages = await uploadImagesFromFiles(files, acl);
          await onAdd(...newImages);
        } catch (error: any) {
          enqueueErrorSnackbar(error?.message ?? Strings.uploadImageError());
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
        enqueueErrorSnackbar(
          error?.message ?? Strings.uploadImageError(imageUrlRef.current)
        );
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

    const virtualizedImages = useVirtualList(value);

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
              label={Strings.imageUrl()}
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
                accept: "image/*",
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
                      <Tooltip title={Strings.addFromUrl()}>
                        <LinkIcon className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    <InputAdornment
                      disablePointerEvents={disabled}
                      position="end"
                      onClick={selectFromLibrary}
                    >
                      <Tooltip title={Strings.addFromLibrary()}>
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
                      <Tooltip title={Strings.addFromFile()}>
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
                          src={value[0].fileThumb?.url?.()}
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
                        ? Strings.multipleImages(value.length)
                        : elide(value[0].name, 20, 3)}
                    </Typography>
                  </InputAdornment>
                ),
                readOnly: true,
              }}
              disabled={disabled}
              {...rest}
            />
            {multiple && !!value.length && (
              <Grid container className={classes.multiImageContainer}>
                {virtualizedImages.map((image: ParseImage) => {
                  const imageDecorations = [
                    <RemoveImageDecoration
                      onClick={async () => {
                        await onRemove!(image);
                      }}
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
                    const checked = coverImage.id === image.id;
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
                      key={image.id}
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
                label={Strings.imageUrl()}
                value={imageUrl}
              />
            </InPortal>
            <input
              type="file"
              style={{ display: "none" }}
              onChange={addFromFile}
              accept="image/*"
              multiple={multiple}
              ref={inputRef}
            />
            <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={closeMenu}>
              <MenuItem onClick={selectFromLibrary}>
                {Strings.addFromLibrary()}
              </MenuItem>
              <MenuItem onClick={() => inputRef.current?.click?.()}>
                {Strings.addFromFile()}
              </MenuItem>
              <MenuItem
                onClick={() =>
                  openPrompt(
                    dialogImageUrlInputPortalNode,
                    addFromUrl,
                    undefined,
                    {
                      title: Strings.addFromUrl(),
                      confirmButtonColor: "success",
                    }
                  )
                }
              >
                {Strings.addFromUrl()}
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
