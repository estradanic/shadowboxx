import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import { ParseImage } from "../../classes";
import { useImageContext } from "../../contexts/ImageContext";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import { useGlobalLoadingStore } from "../../stores";
import { useSnackbar } from "../Snackbar/Snackbar";
import Fab from "./Fab";
import FancyTypography from "../Typography/FancyTypography";
import { Strings } from "../../resources";

const useStyles = makeStyles((theme: Theme) => ({
  deleteFab: {
    transform: `translateX(calc(-100% - ${theme.spacing(1)}px))`,
    backgroundColor: theme.palette.error.contrastText,
    color: theme.palette.error.main,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.error.contrastText,
      color: theme.palette.error.dark,
    },
    "&[disabled]": {
      backgroundColor: theme.palette.error.contrastText,
      color: theme.palette.error.dark,
      opacity: 0.25,
      cursor: "default",
    },
  },
}));

interface DeleteFabProps {
  /** List of images to delete */
  imagesToDelete: ParseImage[];
  /** Function to run after deletion */
  onDelete: () => Promise<void>;
}

/** Floating action button to delete iamge */
const DeleteFab = ({ imagesToDelete, onDelete }: DeleteFabProps) => {
  const classes = useStyles();
  const { deleteImage } = useImageContext();
  const { openConfirm } = useActionDialogContext();
  const { startGlobalLoader, stopGlobalLoader, updateGlobalLoader } =
    useGlobalLoadingStore((store) => ({
      startGlobalLoader: store.startGlobalLoader,
      stopGlobalLoader: store.stopGlobalLoader,
      updateGlobalLoader: store.updateGlobalLoader,
    }));
  const { enqueueErrorSnackbar } = useSnackbar();
  return (
    <Fab
      className={classes.deleteFab}
      onClick={() => {
        openConfirm(
          Strings.message.deleteImagesConfirm,
          async () => {
            startGlobalLoader({
              type: "determinate",
              progress: 0,
              content: (
                <FancyTypography variant="loading">
                  {Strings.message.deletingMemories}
                </FancyTypography>
              ),
            });
            const increment = 100 / imagesToDelete.length;
            let progress = 0;
            try {
              await Promise.all(
                imagesToDelete.map(async (image) => {
                  await deleteImage(image);
                  progress += increment;
                  updateGlobalLoader({ progress });
                })
              );
            } catch {
              enqueueErrorSnackbar(Strings.error.deletingMemories);
            } finally {
              await onDelete();
              stopGlobalLoader();
            }
          },
          () => {},
          {
            confirmButtonText: Strings.action.delete,
            confirmButtonColor: "error",
          }
        );
      }}
      disabled={imagesToDelete.length === 0}
    >
      <DeleteIcon />
    </Fab>
  );
};

export default DeleteFab;
