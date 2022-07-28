import React, { useCallback, useEffect, useRef, useState } from "react";
import { Grid, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import classNames from "classnames";
import { dedupeFast } from "../../utils";
import { Strings } from "../../resources";
import { useUserContext } from "../../contexts";
import { useRandomColor } from "../../hooks";
import { ParseImage } from "../../types";
import ActionDialog, { ActionDialogProps } from "../Dialog/ActionDialog";
import Image from "../Image/Image";
import { useSnackbar } from "../Snackbar";
import Empty from "../Svgs/Empty";
import { Check } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) => ({
  svgContainer: {
    textAlign: "center",
  },
  svgText: {
    fontSize: "medium",
  },
  imageContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(7),
  },
  imageWrapper: {
    position: "relative",
  },
  imageOverlay: {
    cursor: "pointer",
    opacity: 0,
    backgroundColor: theme.palette.success.light,
    position: "absolute",
    top: theme.spacing(1),
    bottom: theme.spacing(1),
    left: theme.spacing(1),
    right: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
    border: `2px solid ${theme.palette.success.dark}`,
  },
  selected: {
    "&&": {
      opacity: 0.7,
    },
  },
  check: {
    color: theme.palette.success.contrastText,
    fontSize: theme.spacing(8),
  },
}));

export interface ImageSelectionDialogProps
  extends Pick<ActionDialogProps, "open" | "handleCancel"> {
  /** Function to run when the confirm button is clicked */
  handleConfirm: (value: ParseImage[]) => Promise<void>;
  /** Value of already selected images */
  value: ParseImage[];
  /** Whether multiple images can be selected */
  multiple?: boolean;
}

/** Component to select images from existing library */
const ImageSelectionDialog = ({
  handleConfirm: piHandleConfirm,
  handleCancel: piHandleCancel,
  value: initialValue,
  open,
  multiple = true,
}: ImageSelectionDialogProps) => {
  const [value, setValue] = useState<ParseImage[]>(initialValue);
  const classes = useStyles();
  const gotImages = useRef(false);

  // Images that the current user owns, not those shared to them.
  const [userOwnedImages, setUserOwnedImages] = useState<ParseImage[]>([]);

  // Images that the current user owns + those in the current value
  const [images, setImages] = useState<ParseImage[]>(initialValue);

  const { loggedInUser } = useUserContext();
  const { enqueueErrorSnackbar } = useSnackbar();
  const randomColor = useRandomColor();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!gotImages.current) {
      ParseImage.query()
        .equalTo(ParseImage.COLUMNS.owner, loggedInUser?.toNativePointer())
        .findAll()
        .then((response) => {
          setUserOwnedImages(
            response?.map((imageResponse) => new ParseImage(imageResponse)) ??
              []
          );
        })
        .catch((error) => {
          enqueueErrorSnackbar(error.message ?? Strings.noImages());
        })
        .finally(() => {
          gotImages.current = true;
        });
    }
  }, [setUserOwnedImages, loggedInUser, enqueueErrorSnackbar]);

  useEffect(() => {
    if (gotImages.current) {
      setImages(dedupeFast<ParseImage>([...initialValue, ...userOwnedImages]));
      setValue(initialValue);
    }
  }, [initialValue, userOwnedImages]);

  const handleConfirm = async () => {
    await piHandleConfirm(value);
  };

  const handleCancel = () => {
    setValue(initialValue);
    piHandleCancel?.();
  };

  const isSelected = useCallback(
    (imageId?: string): boolean => {
      if (!imageId) {
        return false;
      }
      return value.findIndex((image) => image.id === imageId) !== -1;
    },
    [value]
  );

  return (
    <ActionDialog
      fullScreen={sm}
      fullWidth
      maxWidth="lg"
      open={open}
      title={Strings.selectImages()}
      message=""
      handleConfirm={handleConfirm}
      handleCancel={handleCancel}
      type="prompt"
      confirmButtonColor="success"
    >
      {images.length ? (
        <Grid container className={classes.imageContainer}>
          {[...images]
            .sort((a, b) => a.compareTo(b))
            ?.map((image) => (
              <Grid
                key={image.id}
                item
                xs={12}
                md={6}
                lg={4}
                xl={3}
                className={classes.imageWrapper}
              >
                <Image
                  borderColor={randomColor}
                  src={image.mobileFile.url()}
                  alt={image.name}
                />
                <div
                  className={classNames({
                    [classes.selected]: isSelected(image.id),
                    [classes.imageOverlay]: true,
                  })}
                  onClick={() => {
                    if (multiple) {
                      if (isSelected(image.id)) {
                        setValue((prev) =>
                          prev.filter(
                            (selectedImage) => selectedImage.id !== image.id
                          )
                        );
                      } else {
                        setValue((prev) => [...prev, image]);
                      }
                    } else {
                      setValue([image]);
                    }
                  }}
                >
                  <Check className={classes.check} />
                </div>
              </Grid>
            ))}
        </Grid>
      ) : (
        <Grid item className={classes.svgContainer}>
          <Empty height="40vh" />
          <br />
          <Typography className={classes.svgText} variant="overline">
            {Strings.noImages()}
          </Typography>
        </Grid>
      )}
    </ActionDialog>
  );
};

export default ImageSelectionDialog;
