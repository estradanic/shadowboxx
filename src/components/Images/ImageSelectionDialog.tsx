import React, { useCallback, useEffect, useMemo, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import { dedupeFast } from "../../utils";
import { Strings } from "../../resources";
import { useUserContext } from "../../contexts";
import { useRandomColor, useRequests } from "../../hooks";
import { ParseImage } from "../../types";
import ActionDialog, { ActionDialogProps } from "../Dialog/ActionDialog";
import Image from "../Image/Image";
import Empty from "../Svgs/Empty";
import CheckIcon from "@material-ui/icons/Check";
import ImagesSkeleton from "../Skeleton/ImagesSkeleton";

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
  const { getLoggedInUser } = useUserContext();
  const randomColor = useRandomColor();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    getImagesByOwnerFunction,
    getImagesByOwnerQueryKey,
    getImagesByOwnerOptions,
  } = useRequests();

  useEffect(() => {
    setValue((prev) => dedupeFast([...initialValue, ...prev]));
  }, [initialValue]);

  // Images that the current user owns, not those shared to them.
  const { data: userOwnedImages, status } = useQuery<ParseImage[], Error>(
    getImagesByOwnerQueryKey(getLoggedInUser()),
    () =>
      getImagesByOwnerFunction(getLoggedInUser(), {
        showErrorsInSnackbar: true,
      }),
    getImagesByOwnerOptions({ enabled: open })
  );

  // Images that the current user owns + those in the passed in value
  const images = useMemo(
    () => dedupeFast([...initialValue, ...(userOwnedImages ?? [])]),
    [initialValue, userOwnedImages]
  );

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
      {status === "success" && images.length ? (
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
                  <CheckIcon className={classes.check} />
                </div>
              </Grid>
            ))}
        </Grid>
      ) : status === "loading" ? (
        <ImagesSkeleton />
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