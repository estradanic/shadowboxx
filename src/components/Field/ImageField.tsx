import React, { useState, memo, useMemo, ChangeEventHandler } from "react";
import {
  InputAdornment,
  Avatar,
  Typography,
  Grid,
  Menu,
  MenuItem,
  IconButton,
  IconButtonProps,
} from "@material-ui/core";
import { Close, AddAPhoto, Link, Check, Cloud } from "@material-ui/icons";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Parse from "parse";
import uniqueId from "lodash/uniqueId";
import classNames from "classnames";
import { Set } from "immutable";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { readAndCompressImage } from "browser-image-resizer";
import { elide, makeValidFileName, removeExtension } from "../../utils";
import { Strings } from "../../resources";
import { ParseImage } from "../../types";
import { useRandomColor, useRefState } from "../../hooks";
import TextField, { TextFieldProps } from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";
import { useSnackbar } from "../Snackbar/Snackbar";
import {
  useGlobalLoadingContext,
  useImageContext,
  useUserContext,
} from "../../contexts";
import Image from "../Image/Image";
import RemoveImageDecoration from "../Image/Decoration/RemoveImageDecoration";
import CoverImageDecoration from "../Image/Decoration/CoverImageDecoration";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import { FancyTypography } from "../Typography";

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
  coverImage: {
    backgroundColor: theme.palette.warning.contrastText,
    borderRadius: "100%",
    color: theme.palette.warning.main,
    position: "absolute",
    bottom: 0,
    right: 0,
    cursor: "pointer",
    zIndex: 99,
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(-1),
  },
  notCoverImage: {
    color: theme.palette.warning.contrastText,
    borderRadius: "100%",
    backgroundColor: theme.palette.warning.main,
    position: "absolute",
    bottom: 0,
    right: 0,
    cursor: "pointer",
    zIndex: 99,
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(-1),
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
  resizingImages: {
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.h3.fontSize,
  },
}));

/** Interface defining props for ImageField */
export interface ImageFieldProps
  extends Omit<TextFieldProps, "value" | "onChange" | "variant"> {
  /** Value of the field, array of Images */
  value: ParseImage[];
  /** Function to run when the value changes */
  onChange: (value: ParseImage[]) => Promise<void>;
  /** Whether multiple images can be selected or not */
  multiple?: boolean;
  /** ACL to save new images with after upload */
  acl?: Parse.ACL;
  /** Variant for how to display the field */
  variant?: "button" | "field";
  /** Props to pass to the IconButton when variant=="button" */
  ButtonProps?: IconButtonProps;
}

/** Component to input images from the filesystem or online */
const ImageField = memo(
  ({
    onChange: piOnChange,
    label,
    value = [],
    multiple = false,
    acl,
    variant = "field",
    ButtonProps = {},
    disabled,
    ...rest
  }: ImageFieldProps) => {
    const classes = useStyles();

    const { uploadImage, promptImageSelectionDialog } = useImageContext();
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
    const [imageUrlRef, imageUrl, setImageUrl] = useRefState("");
    const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingContext();

    const { getLoggedInUser } = useUserContext();

    const [anchorEl, setAnchorEl] = useState<Element>();
    const closeMenu = () => setAnchorEl(undefined);

    const inputId = uniqueId("profile-pic-input");
    const urlInputId = uniqueId("image-url-input");

    const { enqueueErrorSnackbar } = useSnackbar();

    const randomColor = useRandomColor();

    const onChange = async (newValue: ParseImage[]) => {
      await piOnChange(Array.from(Set(newValue)));
    };

    const { openPrompt } = useActionDialogContext();

    const addFromFile: ChangeEventHandler<HTMLInputElement> = async (event) => {
      if (event.target.files?.[0]) {
        startGlobalLoader({
          type: "indeterminate",
          content: (
            <FancyTypography className={classes.resizingImages}>
              {Strings.processingImages()}
            </FancyTypography>
          ),
        });
        let files: File[] = [];
        const fileNames: string[] = [];
        for (let i = 0; i < event.target.files.length; i++) {
          files[i] = event.target.files[i];
          fileNames[i] = event.target.files[i].name;
        }
        const max = multiple ? files.length : 1;
        const resizeImagePromises: Promise<File>[] = [];
        for (let i = 0; i < max; i++) {
          let file = files[i];
          if (file.size > 15000000) {
            resizeImagePromises.push(
              readAndCompressImage(file, {
                quality: 1,
                maxWidth: 2400,
                maxHeight: 2400,
                mimeType: "image/webp",
              })
            );
          } else {
            resizeImagePromises.push(Promise.resolve(file));
          }
        }
        files = await Promise.all(resizeImagePromises);
        stopGlobalLoader();
        const newImagePromises: Promise<ParseImage>[] = [];
        for (let i = 0; i < max; i++) {
          let file = files[i];
          const fileName = makeValidFileName(fileNames[i]);
          const parseFile = new Parse.File(fileName, file);
          newImagePromises.push(
            uploadImage(
              {
                file: parseFile,
                isCoverImage: false,
                owner: getLoggedInUser().toPointer(),
                name: removeExtension(fileName),
              },
              acl
            )
          );
        }
        try {
          const newImages = await Promise.all(newImagePromises);
          const newValue = multiple ? [...value, ...newImages] : newImages;
          await onChange(newValue);
        } catch (error: any) {
          enqueueErrorSnackbar(error?.message ?? Strings.uploadImageError());
        }
      }
    };

    const addFromUrl = async () => {
      const fileName = makeValidFileName(
        imageUrlRef.current.substring(imageUrlRef.current.lastIndexOf("/") + 1)
      );
      const parseFile = new Parse.File(fileName, { uri: imageUrlRef.current });
      try {
        const newImage = await uploadImage(
          {
            file: parseFile,
            isCoverImage: false,
            owner: getLoggedInUser().toPointer(),
            name: removeExtension(fileName),
          },
          acl
        );
        const newValue = multiple ? [...value, newImage] : [newImage];
        await onChange(newValue);
      } catch (error: any) {
        enqueueErrorSnackbar(
          error?.message ?? Strings.uploadImageError(fileName)
        );
      }
      setShowUrlInput(false);
      setImageUrl("");
    };

    const openUrlInput = () => {
      setShowUrlInput(true);
      document.getElementById(urlInputId)?.focus();
    };

    const setCoverImage = async (image: ParseImage, index: number) => {
      const newValue = [...value];
      const currentCoverImageIndex = value.findIndex((i) => i.isCoverImage);
      image.isCoverImage = true;
      try {
        if (currentCoverImageIndex !== -1) {
          value[currentCoverImageIndex].isCoverImage = false;
          newValue[currentCoverImageIndex] = await value[
            currentCoverImageIndex
          ].save();
        }
        newValue[index] = await image.save();
        await onChange(newValue);
      } catch (error: any) {
        enqueueErrorSnackbar(error?.message ?? Strings.commonError());
        image.isCoverImage = false;
        if (currentCoverImageIndex !== -1) {
          value[currentCoverImageIndex].isCoverImage = true;
        }
      }
    };

    const unsetCoverImage = async (image: ParseImage, index: number) => {
      const newValue = [...value];
      image.isCoverImage = false;
      try {
        newValue[index] = await image.save();
        await onChange(newValue);
      } catch (error: any) {
        enqueueErrorSnackbar(error?.message ?? Strings.commonError());
        image.isCoverImage = true;
      }
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
              id={urlInputId}
              inputRef={(input) => input && input.focus()}
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
                      <Check
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
                      <Close color="error" className={classes.endAdornment} />
                    </InputAdornment>
                  </>
                ),
              }}
            />
            <TextField // Main input
              className={classes.main}
              id={inputId}
              style={{ display: showUrlInput ? "none" : "inherit" }}
              onChange={addFromFile}
              fullWidth
              inputProps={{
                accept: "image/*",
                multiple,
                className: classes.input,
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
                        <Link className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    <InputAdornment
                      disablePointerEvents={disabled}
                      position="end"
                      onClick={() =>
                        promptImageSelectionDialog({
                          handleConfirm: async (newValue) =>
                            await onChange(
                              multiple ? [...value, ...newValue] : newValue
                            ),
                          value,
                        })
                      }
                    >
                      <Tooltip title={Strings.addFromLibrary()}>
                        <Cloud className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    <InputAdornment
                      disablePointerEvents={disabled}
                      position="end"
                      onClick={() => document.getElementById(inputId)?.click()}
                    >
                      <Tooltip title={Strings.addFromFile()}>
                        <AddAPhoto className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    {!!value.length && !multiple && (
                      <InputAdornment
                        disablePointerEvents={disabled}
                        position="end"
                      >
                        <Avatar
                          className={classes.endAdornmentAvatar}
                          src={value[0].thumbnail.url()}
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
                {[...value.sort((a, b) => a.compareTo(b))].map(
                  (image: ParseImage, index) => {
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
                          src={image.mobileFile.url()}
                          alt={image.name}
                          decorations={[
                            <RemoveImageDecoration
                              onClick={async () => {
                                const newValue = value.filter(
                                  (valueImage) => image.id !== valueImage.id
                                );
                                await onChange(newValue);
                              }}
                            />,
                            <CoverImageDecoration
                              checked={image.isCoverImage}
                              onClick={async () => {
                                if (image.isCoverImage) {
                                  await unsetCoverImage(image, index);
                                } else {
                                  await setCoverImage(image, index);
                                }
                              }}
                            />,
                          ]}
                        />
                      </Grid>
                    );
                  }
                )}
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
              id={inputId}
              type="file"
              style={{ display: "none" }}
              onChange={addFromFile}
              accept="image/*"
              multiple={multiple}
            />
            <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={closeMenu}>
              <MenuItem
                onClick={() =>
                  promptImageSelectionDialog({
                    handleConfirm: async (newValue) =>
                      await onChange(
                        multiple ? [...value, ...newValue] : newValue
                      ),
                    value,
                  })
                }
              >
                {Strings.addFromLibrary()}
              </MenuItem>
              <MenuItem
                onClick={() => document.getElementById(inputId)?.click()}
              >
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
              <AddAPhoto className={classes.endAdornment} />
            </IconButton>
          </>
        )}
      </>
    );
  }
);

export default ImageField;
