import React, { useMemo, useState } from "react";
import { ParseDuplicate, ParseImage } from "../../../classes";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { useQuery } from "@tanstack/react-query";
import { Strings } from "../../../resources";
import { Notification } from "../../../contexts";
import { useActionDialogContext } from "../../Dialog/ActionDialog";
import { useQueryConfigs, useRandomColor } from "../../../hooks";
import Image from "../../Image/Image";

const useStyles = makeStyles((theme: Theme) => ({
  resolveButton: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  ignoreButton: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    marginRight: theme.spacing(1),
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
  notification?: Notification;
}

/** Component displaying actions for the user to take about a Duplicates notification */
const DuplicatesNotificationDetail = ({
  duplicates,
  notification,
}: DuplicatesNotificationDetailProps) => {
  const classes = useStyles();
  const randomColor = useRandomColor();

  const [confirmedDuplicateIds, setConfirmedDuplicateIds] = useState<string[]>(duplicates.map((duplicate) => duplicate.id));

  const { openPrompt } = useActionDialogContext();
  const imageIds = useMemo(
    () =>
      duplicates.flatMap((duplicate) => [
        duplicate.image1.id,
        duplicate.image2.id,
      ]),
    [duplicates]
  );

  const { getImagesByIdQueryKey, getImagesByIdFunction, getImagesByIdOptions } =
    useQueryConfigs();

  const { data: images } = useQuery<ParseImage[], Error>(
    getImagesByIdQueryKey(imageIds),
    () => getImagesByIdFunction(imageIds),
    getImagesByIdOptions()
  );

  const resolve = async () => {
    // Todo: Implement
    notification?.remove();
  };

  const reset = () => {
    setConfirmedDuplicateIds(duplicates.map((duplicate) => duplicate.id));
  };

  const resolveDialogPortalNode = useMemo(() => createHtmlPortalNode(), []);

  return (
    <>
      <InPortal node={resolveDialogPortalNode}>
        {images && (
          <Grid container spacing={2}>
            {duplicates.map((duplicate) => (
              <Grid item container xs={12} key={duplicate.id}>
                <Grid item xs={12} container>
                  <Grid item xs={6}>
                    <Image
                      borderColor={randomColor}
                      showFullResolutionOnClick
                      parseImage={
                        images.find(
                          (image) => image.id === duplicate.image1.id
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
                          (image) => image.id === duplicate.image2.id
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
                        checked={confirmedDuplicateIds.includes(duplicate.id)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setConfirmedDuplicateIds([
                              ...confirmedDuplicateIds,
                              duplicate.id,
                            ]);
                          } else {
                            setConfirmedDuplicateIds(
                              confirmedDuplicateIds.filter(
                                (id) => id !== duplicate.id
                              )
                            );
                          }
                        }}
                      />
                    }
                    label={Strings.isDuplicate()}
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
            {Strings.duplicatesNotificationDetail(duplicates.length)}
          </Typography>
        </Grid>
        <Grid item xs={5} className={classes.buttonContainer}>
          <Button
            onClick={() => {
              openPrompt(resolveDialogPortalNode, resolve, reset, {
                confirmButtonColor: "success",
                confirmButtonText: Strings.resolve(),
                fullScreen: true,
                title: Strings.resolveDuplicates(),
              });
            }}
            variant="contained"
            className={classes.resolveButton}
            size="small"
          >
            {Strings.resolve()}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default DuplicatesNotificationDetail;
