import React, { MutableRefObject, useMemo, useState } from "react";
import Parse from "parse";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ParseDuplicate, ParseImage } from "../../../classes";
import { Strings } from "../../../resources";
import { useGlobalLoadingStore } from "../../../stores";
import { useActionDialogContext } from "../../Dialog/ActionDialog";
import Image from "../../Image/Image";
import { useSnackbar } from "../../Snackbar";
import { useNetworkDetectionContext } from "../../../contexts/NetworkDetectionContext";
import {
  useNotificationsContext,
  Notification,
} from "../../../contexts/NotificationsContext";
import useQueryConfigs from "../../../hooks/Query/useQueryConfigs";
import useRandomColor from "../../../hooks/useRandomColor";

const useStyles = makeStyles((theme: Theme) => ({
  resolveButton: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  buttonContainer: {
    textAlign: "end",
  },
  textContainer: {
    paddingTop: theme.spacing(0.5),
  },
}));
export interface DuplicatesNotificationDetailProps {
  /** The duplicate records in question */
  duplicates: ParseDuplicate[];
  /** The notification record in NotificationsContext */
  notificationRef: MutableRefObject<Notification | undefined>;
}

/** Component displaying actions for the user to take about a Duplicates notification */
const DuplicatesNotificationDetail = ({
  duplicates,
  notificationRef = { current: undefined },
}: DuplicatesNotificationDetailProps) => {
  const classes = useStyles();
  const randomColor = useRandomColor();
  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore(
    (state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
    })
  );
  const { setNotificationMenuOpen } = useNotificationsContext();

  const [duplicateIds, setDuplicateIds] = useState<string[]>([]);

  const { openPrompt } = useActionDialogContext();
  const imageIds = useMemo(
    () =>
      duplicates.flatMap((duplicate) => [
        duplicate.image1.id,
        duplicate.image2.id,
      ]),
    [duplicates]
  );

  const queryClient = useQueryClient();
  const {
    getImagesByIdQueryKey,
    getImagesByIdFunction,
    getImagesByIdOptions,
    getDuplicatesQueryKey,
  } = useQueryConfigs();

  const { online } = useNetworkDetectionContext();

  const { data: images } = useQuery<ParseImage[], Error>(
    getImagesByIdQueryKey(imageIds),
    () => getImagesByIdFunction(online, imageIds),
    getImagesByIdOptions()
  );

  const resolve = async () => {
    try {
      startGlobalLoader();
      const ignoredDuplicates = duplicates.filter(
        (duplicate) => !duplicateIds.includes(duplicate.objectId)
      );
      await Promise.all(
        ignoredDuplicates.map((duplicate) => duplicate.acknowledge())
      );
      await Parse.Cloud.run("resolveDuplicates", {
        duplicateIds: duplicateIds,
      });
      notificationRef.current?.remove();
      enqueueSuccessSnackbar(Strings.success.saved);
    } catch (error) {
      console.error(error);
      enqueueErrorSnackbar(Strings.error.resolvingDuplicates);
    } finally {
      stopGlobalLoader();
      queryClient.invalidateQueries({ queryKey: [getDuplicatesQueryKey()] });
      setNotificationMenuOpen(false);
    }
  };

  const reset = () => {
    setDuplicateIds(duplicates.map((duplicate) => duplicate.objectId));
  };

  const resolveDialogPortalNode = useMemo(() => createHtmlPortalNode(), []);

  return (
    <>
      <InPortal node={resolveDialogPortalNode}>
        {images && (
          <Grid container spacing={2}>
            {duplicates.map((duplicate) => (
              <Grid item container xs={12} key={duplicate.objectId}>
                <Grid item xs={12} container>
                  <Grid item xs={6}>
                    <Image
                      borderColor={randomColor}
                      showFullResolutionOnClick
                      parseImage={
                        images.find(
                          (image) => image.objectId === duplicate.image1.id
                        )!
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Image
                      borderColor={randomColor}
                      showFullResolutionOnClick
                      parseImage={
                        images.find(
                          (image) => image.objectId === duplicate.image2.id
                        )!
                      }
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        color="primary"
                        checked={duplicateIds.includes(duplicate.objectId)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setDuplicateIds([
                              ...duplicateIds,
                              duplicate.objectId,
                            ]);
                          } else {
                            setDuplicateIds(
                              duplicateIds.filter(
                                (id) => id !== duplicate.objectId
                              )
                            );
                          }
                        }}
                      />
                    }
                    label={Strings.prompt.isDuplicate}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        )}
      </InPortal>
      <Grid container>
        <Grid item xs={7} className={classes.textContainer}>
          <Typography>
            {Strings.message.duplicatesNotificationDetail(duplicates.length)}
          </Typography>
        </Grid>
        <Grid item xs={5} className={classes.buttonContainer}>
          <Button
            onClick={() => {
              openPrompt(resolveDialogPortalNode, resolve, reset, {
                confirmButtonColor: "success",
                confirmButtonText: Strings.action.resolve,
                fullScreen: true,
                title: Strings.action.resolveDuplicates,
              });
            }}
            variant="contained"
            className={classes.resolveButton}
            size="small"
          >
            {Strings.action.resolve}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default DuplicatesNotificationDetail;
