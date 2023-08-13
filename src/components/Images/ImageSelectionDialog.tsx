import React, { useCallback, useMemo, useState } from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import classNames from "classnames";
import { useInfiniteQuery } from "@tanstack/react-query";
import { difference } from "../../utils";
import { Strings } from "../../resources";
import { ParseImage } from "../../classes";
import ActionDialog, { ActionDialogProps } from "../Dialog/ActionDialog";
import { ImageProps } from "../Image/Image";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import Images from "../Image/Images";
import useImageStyles from "../Image/useImageStyles";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import { useUserContext } from "../../contexts/UserContext";
import useInfiniteQueryConfigs from "../../hooks/Query/useInfiniteQueryConfigs";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import useRandomColor from "../../hooks/useRandomColor";

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
  const classes = useImageStyles();
  const { getLoggedInUser } = useUserContext();
  const randomColor = useRandomColor();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    getImagesByOwnerInfiniteFunction,
    getImagesByOwnerInfiniteQueryKey,
    getImagesByOwnerInfiniteOptions,
  } = useInfiniteQueryConfigs();
  const { online } = useNetworkDetectionContext();

  // Images that the current user owns, not those shared to them.
  const { data, status, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<
    ParseImage[],
    Error
  >(
    getImagesByOwnerInfiniteQueryKey(getLoggedInUser()),
    ({ pageParam: page = 0 }) =>
      getImagesByOwnerInfiniteFunction(online, getLoggedInUser(), {
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
      return value.findIndex((image) => image.objectId === imageId) !== -1;
    },
    [value]
  );

  const getImageProps = useCallback(
    async (image: ParseImage): Promise<Partial<ImageProps>> => ({
      className: classNames({
        [classes.selected]: isSelected(image.objectId),
        [classes.unselected]: !isSelected(image.objectId),
      }),
      showFullResolutionOnClick: false,
      onClick: () => {
        if (multiple) {
          if (isSelected(image.objectId)) {
            setValue((prev) =>
              prev.filter(
                (selectedImage) => selectedImage.objectId !== image.objectId
              )
            );
          } else {
            setValue((prev) => [...prev, image]);
          }
        } else {
          setValue([image]);
        }
      },
    }),
    [classes.unselected, classes.selected, multiple, isSelected]
  );

  return (
    <ActionDialog
      fullScreen={sm}
      fullWidth
      maxWidth="lg"
      open={open}
      title={
        multiple ? Strings.action.selectImages : Strings.action.selectImage
      }
      message=""
      handleConfirm={handleConfirm}
      handleCancel={handleCancel}
      type="prompt"
      confirmButtonColor="success"
      DialogContentProps={{ id: SCROLLABLE_ELEMENT_ID }}
    >
      <Images
        status={status}
        images={images}
        outlineColor={randomColor}
        getImageProps={getImageProps}
      />
    </ActionDialog>
  );
};

export default ImageSelectionDialog;
