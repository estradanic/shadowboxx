import React, { useCallback, useMemo, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import classNames from "classnames";
import { useInfiniteQuery } from "@tanstack/react-query";
import { difference } from "../../utils";
import { Strings } from "../../resources";
import { useUserContext } from "../../contexts";
import {
  useRandomColor,
  useInfiniteQueryConfigs,
  useInfiniteScroll,
} from "../../hooks";
import { ParseImage } from "../../classes";
import ActionDialog, { ActionDialogProps } from "../Dialog/ActionDialog";
import Image from "../Image/Image";
import Empty from "../Svgs/Empty";
import CheckIcon from "@material-ui/icons/Check";
import ImagesSkeleton from "../Skeleton/ImagesSkeleton";
import { DEFAULT_PAGE_SIZE } from "../../constants";

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
  /** List of already selected images */
  alreadySelected: ParseImage[];
  /** Whether multiple images can be selected */
  multiple?: boolean;
}

/** Component to select images from existing library */
const ImageSelectionDialog = ({
  handleConfirm: piHandleConfirm,
  handleCancel: piHandleCancel,
  alreadySelected,
  open,
  multiple = true,
}: ImageSelectionDialogProps) => {
  const [value, setValue] = useState<ParseImage[]>([]);
  const classes = useStyles();
  const { getLoggedInUser } = useUserContext();
  const randomColor = useRandomColor();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    getImagesByOwnerInfiniteFunction,
    getImagesByOwnerInfiniteQueryKey,
    getImagesByOwnerInfiniteOptions,
  } = useInfiniteQueryConfigs();

  // Images that the current user owns, not those shared to them.
  const { data, status, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<
    ParseImage[],
    Error
  >(
    getImagesByOwnerInfiniteQueryKey(getLoggedInUser()),
    ({ pageParam: page = 0 }) =>
      getImagesByOwnerInfiniteFunction(getLoggedInUser(), {
        showErrorsInSnackbar: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    getImagesByOwnerInfiniteOptions({ enabled: open })
  );
  const SCROLLABLE_ELEMENT_ID = "image-selection-dialog-content";
  useInfiniteScroll(fetchNextPage, {
    canExecute: !isFetchingNextPage && open,
    elementQuerySelector: `#${SCROLLABLE_ELEMENT_ID}`,
  });
  const userOwnedImages = useMemo(
    () => data?.pages?.flatMap((page) => page),
    [data?.pages]
  );

  // Images that the current user owns + those in the passed in value
  const images = useMemo(
    () => difference(userOwnedImages ?? [], alreadySelected),
    [alreadySelected, userOwnedImages]
  );

  const handleConfirm = async () => {
    await piHandleConfirm(value);
  };

  const handleCancel = () => {
    setValue([]);
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
      DialogContentProps={{ id: SCROLLABLE_ELEMENT_ID }}
    >
      {status === "success" && images.length ? (
        <Grid container className={classes.imageContainer}>
          {images?.map((image) => (
            <Grid
              key={image.id}
              item
              xs={12}
              md={6}
              lg={4}
              xl={3}
              className={classes.imageWrapper}
            >
              <Image borderColor={randomColor} parseImage={image} />
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
