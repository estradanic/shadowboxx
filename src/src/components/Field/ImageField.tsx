import React, { useState, memo } from "react";
import {
  InputAdornment,
  Avatar,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import {
  Close,
  AddAPhoto,
  Link,
  Check,
  Remove,
  Star,
  StarBorder,
} from "@material-ui/icons";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { elide } from "../../utils/stringUtils";
import Strings from "../../resources/Strings";
import { uniqueId } from "lodash";
import TextField, { TextFieldProps } from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";
import Parse from "parse";
import ParseImage from "../../types/Image";
import { useSnackbar } from "../Snackbar/Snackbar";
import { useImageContext } from "../../app/ImageContext";

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
  multiImage: {
    maxWidth: "100%",
    width: theme.spacing(35),
    display: "block",
    borderRadius: theme.spacing(0.5),
    overflow: "hidden",
  },
  multiImageContainer: {
    textAlign: "center",
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(2),
  },
  removeImage: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderRadius: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    cursor: "pointer",
    zIndex: 99,
    marginLeft: theme.spacing(-1),
    marginTop: theme.spacing(-1),
    border: `2px solid ${theme.palette.error.contrastText}`,
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
  imageWrapper: {
    position: "relative",
    display: "inline-block",
    width: "fit-content",
    height: "fit-content",
    margin: theme.spacing(1),
    backgroundColor: "transparent",
  },
  main: {
    "& > div": {
      cursor: "default",
    },
  },
  progress: {
    marginTop: "50%",
    marginLeft: "25%",
    marginRight: "25%",
  },
}));

/** Interface defining props for ImageField */
export interface ImageFieldProps
  extends Omit<TextFieldProps, "value" | "onChange"> {
  /** Value of the field, array of Images */
  value: ParseImage[];
  /** Function to run when the value changes */
  onChange: (value: ParseImage[]) => void;
  /** Whether to only save the thumbnail or not */
  thumbnailOnly?: boolean;
  /** Whether multiple images can be selected or not */
  multiple?: boolean;
}

/** Component to input images from the filesystem or online */
const ImageField = memo(
  ({
    onChange,
    label,
    thumbnailOnly = false,
    value = [],
    multiple = false,
    ...rest
  }: ImageFieldProps) => {
    const classes = useStyles();

    const { uploadImage, progress, loading, deleteImage } = useImageContext();
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>("");

    const inputId = uniqueId("profile-pic-input");
    const urlInputId = uniqueId("image-url-input");

    const { enqueueErrorSnackbar } = useSnackbar();

    const addFromFile = (event: any) => {
      if (event.target.files?.[0]) {
        const max = multiple ? event.target.files.length : 1;
        const newImages: ParseImage[] = [];
        for (let i = 0; i < max; i++) {
          const file: any = event.target.files[i];
          const parseFile = new Parse.File(file.name, file);
          uploadImage({ file: parseFile, isCoverImage: false })
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

    const addImageFromUrl = () => {
      const fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
      const parseFile = new Parse.File(fileName, { uri: imageUrl });
      const newImage = ParseImage.fromAttributes({
        file: parseFile,
        isCoverImage: false,
      });

      setShowUrlInput(false);
      if (multiple) {
        onChange([...value, newImage]);
      } else {
        onChange([newImage]);
      }
    };

    const openUrlInput = () => {
      setShowUrlInput(true);
      document.getElementById(urlInputId)?.focus();
    };

    return (
      <>
        <TextField // Url src input
          style={{ display: showUrlInput ? "inherit" : "none" }}
          id={urlInputId}
          inputRef={(input) => input && input.focus()}
          fullWidth
          onChange={(event) => setImageUrl(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              addImageFromUrl();
            }
          }}
          value={imageUrl}
          label={Strings.imageUrl()}
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position="end" onClick={addImageFromUrl}>
                  <Check className={classes.endAdornment} />
                </InputAdornment>
                <InputAdornment
                  position="end"
                  onClick={() => setShowUrlInput(false)}
                >
                  <Close className={classes.endAdornment} />
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
          <div className={classes.multiImageContainer}>
            {loading && (
              <LinearProgress className={classes.progress} value={progress} />
            )}
            {value.map((image: ParseImage, index) => {
              const file = image.file;
              return (
                <div className={classes.imageWrapper} key={uniqueId(image.id)}>
                  <Tooltip title={Strings.removeImage()}>
                    <Remove
                      fontSize="large"
                      className={classes.removeImage}
                      onClick={async () => {
                        const newValue = value.filter(
                          (valueImage) => image.id !== valueImage.id
                        );
                        onChange(newValue);
                        await deleteImage(image);
                      }}
                    />
                  </Tooltip>
                  {image.isCoverImage ? (
                    <Tooltip title={Strings.unsetCoverImage()}>
                      <Star
                        fontSize="large"
                        className={classes.coverImage}
                        onClick={async () => {
                          const newValue = [...value];
                          image.isCoverImage = false;
                          try {
                            newValue[index] = await image.save();
                            onChange(newValue);
                          } catch (error: any) {
                            enqueueErrorSnackbar(
                              error?.message ?? Strings.commonError()
                            );
                            image.isCoverImage = true;
                          }
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title={Strings.setImageAsCover()}>
                      <StarBorder
                        fontSize="large"
                        className={classes.coverImage}
                        onClick={async () => {
                          const newValue = [...value];
                          const currentCoverImageIndex = value.findIndex(
                            (i) => i.isCoverImage
                          );
                          image.isCoverImage = true;
                          try {
                            if (currentCoverImageIndex !== -1) {
                              value[
                                currentCoverImageIndex
                              ].isCoverImage = false;
                              newValue[currentCoverImageIndex] = await value[
                                currentCoverImageIndex
                              ].save();
                            }
                            newValue[index] = await image.save();
                            onChange(newValue);
                          } catch (error: any) {
                            enqueueErrorSnackbar(
                              error?.message ?? Strings.commonError()
                            );
                            image.isCoverImage = false;
                            if (currentCoverImageIndex !== -1) {
                              value[currentCoverImageIndex].isCoverImage = true;
                            }
                          }
                        }}
                      />
                    </Tooltip>
                  )}
                  <img
                    className={classes.multiImage}
                    src={file.url()}
                    alt={file.name()}
                  />
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }
);

export default ImageField;
