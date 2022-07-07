import React, { useState, memo, useMemo } from "react";
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
import { elide, makeValidFileName } from "../../utils";
import { Strings } from "../../resources";
import { ParseImage } from "../../types";
import { useRandomColor, useRefState } from "../../hooks";
import TextField, { TextFieldProps } from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";
import { useSnackbar } from "../Snackbar/Snackbar";
import { useImageContext, useUserContext } from "../../contexts";
import Image from "../Image/Image";
import RemoveImageDecoration from "../Image/Decoration/RemoveImageDecoration";
import CoverImageDecoration from "../Image/Decoration/CoverImageDecoration";
import ImageSelectionDialog from "../Images/ImageSelectionDialog";
import { useActionDialogContext } from "../Dialog/ActionDialog";

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
}));

/** Interface defining props for ImageField */
export interface ImageFieldProps
  extends Omit<TextFieldProps, "value" | "onChange" | "variant"> {
  /** Value of the field, array of Images */
  value: ParseImage[];
  /** Function to run when the value changes */
  onChange: (value: ParseImage[]) => void;
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
    ...rest
  }: ImageFieldProps) => {
    const classes = useStyles();

    const { uploadImage } = useImageContext();
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
    const [showLibraryDialog, setShowLibraryDialog] = useState<boolean>(false);
    const [imageUrlRef, imageUrl, setImageUrl] = useRefState("");

    const { loggedInUser } = useUserContext();

    const [anchorEl, setAnchorEl] = useState<Element>();
    const closeMenu = () => setAnchorEl(undefined);

    const inputId = uniqueId("profile-pic-input");
    const urlInputId = uniqueId("image-url-input");

    const { enqueueErrorSnackbar } = useSnackbar();

    const randomColor = useRandomColor();

    const onChange = (newValue: ParseImage[]) => {
      piOnChange(Array.from(Set(newValue)));
    };

    const { openPrompt } = useActionDialogContext();

    const addFromFile = (event: any) => {
      if (event.target.files?.[0]) {
        const max = multiple ? event.target.files.length : 1;
        const newImages: ParseImage[] = [];
        for (let i = 0; i < max; i++) {
          const file: any = event.target.files[i];
          const parseFile = new Parse.File(makeValidFileName(file.name), file);
          uploadImage(
            {
              file: parseFile,
              isCoverImage: false,
              owner: loggedInUser!.toPointer(),
            },
            acl
          )
            .then((newImage) => {
              newImages.push(newImage);
              const newValue = multiple ? [...value, ...newImages] : newImages;
              onChange(newValue);
            })
            .catch((error) => {
              enqueueErrorSnackbar(
                error?.message ?? Strings.uploadImageError(file.name)
              );
            });
        }
      }
    };

    const addFromUrl = () => {
      const fileName = imageUrlRef.current.substring(
        imageUrlRef.current.lastIndexOf("/") + 1
      );
      const parseFile = new Parse.File(fileName, { uri: imageUrlRef.current });
      uploadImage(
        {
          file: parseFile,
          isCoverImage: false,
          owner: loggedInUser!.toPointer(),
        },
        acl
      )
        .then((newImage) => {
          const newValue = multiple ? [...value, newImage] : [newImage];
          onChange(newValue);
        })
        .catch((error) => {
          enqueueErrorSnackbar(
            error?.message ?? Strings.uploadImageError(fileName)
          );
        });

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
        onChange(newValue);
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
        onChange(newValue);
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
        <ImageSelectionDialog
          value={value}
          open={showLibraryDialog}
          handleConfirm={(newValue) => {
            onChange([...value, ...newValue]);
            setShowLibraryDialog(false);
          }}
          handleCancel={() => setShowLibraryDialog(false)}
        />
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
                    <InputAdornment onClick={openUrlInput} position="end">
                      <Tooltip title={Strings.addFromUrl()}>
                        <Link className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    <InputAdornment
                      position="end"
                      onClick={() => setShowLibraryDialog(true)}
                    >
                      <Tooltip title={Strings.addFromLibrary()}>
                        <Cloud className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    <InputAdornment
                      position="end"
                      onClick={() => document.getElementById(inputId)?.click()}
                    >
                      <Tooltip title={Strings.addFromFile()}>
                        <AddAPhoto className={classes.endAdornment} />
                      </Tooltip>
                    </InputAdornment>
                    {!!value.length && !multiple && (
                      <InputAdornment position="end">
                        <Avatar
                          className={classes.endAdornmentAvatar}
                          src={value[0].file.url()}
                          alt={value[0].file.name()}
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
                        : elide(value[0].file.name(), 20, 3)}
                    </Typography>
                  </InputAdornment>
                ),
                readOnly: true,
              }}
              {...rest}
            />
            {multiple && !!value.length && (
              <Grid container className={classes.multiImageContainer}>
                {value.map((image: ParseImage, index) => {
                  const file = image.file;
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
                        src={file.url()}
                        alt={file.name()}
                        decorations={[
                          <RemoveImageDecoration
                            onClick={() => {
                              const newValue = value.filter(
                                (valueImage) => image.id !== valueImage.id
                              );
                              onChange(newValue);
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
              id={inputId}
              type="file"
              style={{ display: "none" }}
              onChange={addFromFile}
              accept="image/*"
              multiple
            />
            <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={closeMenu}>
              <MenuItem onClick={() => setShowLibraryDialog(true)}>
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
