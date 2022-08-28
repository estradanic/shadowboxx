import React, { useCallback, useMemo, useState } from "react";
import Parse from "parse";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import { useQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import { ErrorState, isNullOrWhitespace } from "../../utils";
import { ImageContextProvider, useUserContext } from "../../contexts";
import { ParseUser, ParseImage, Album } from "../../types";
import { useRequests } from "../../hooks";
import ActionDialog, {
  ActionDialogProps,
  useActionDialogContext,
} from "../Dialog/ActionDialog";
import ImageField from "../Field/ImageField";
import { useSnackbar } from "../Snackbar/Snackbar";
import UserField from "../Field/UserField";
import TextField from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";

const useStyles = makeStyles((theme: Theme) => ({
  checkboxLabel: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1.5),
    width: "100%",
    "& > span:nth-child(2)": {
      marginRight: "auto",
    },
  },
  checkbox: {
    height: theme.spacing(7),
    borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    "&:hover": {
      borderBottom: `1px solid ${theme.palette.text.primary}`,
    },
  },
  favoriteIcon: {
    marginLeft: "auto",
    marginRight: theme.spacing(1.5),
    color: theme.palette.warning.main,
    borderColor: theme.palette.warning.main,
  },
}));

/** Interface defining props for AlbumFormDialog */
export interface AlbumFormDialogProps
  extends Pick<ActionDialogProps, "open" | "handleCancel"> {
  /** Value for the component */
  value: Album;
  /** Function to run when the confirm button is clicked */
  handleConfirm: (value: Album) => Promise<void>;
  /** Whether to reset dialog state when confirm button is clicked */
  resetOnConfirm?: boolean;
}

/** Component to input values for creating or editing an Album */
const AlbumFormDialog = ({
  value,
  open,
  handleCancel: piHandleCancel,
  handleConfirm: piHandleConfirm,
  resetOnConfirm = true,
}: AlbumFormDialogProps) => {
  const [imageIds, setImageIds] = useState<Album["images"]>(value.images);
  const [name, setName] = useState<Album["name"]>(value.name);
  const [description, setDescription] = useState<Album["description"]>(
    value.description
  );
  const [isFavorite, setIsFavorite] = useState<Album["isFavorite"]>(
    value.isFavorite
  );
  const [collaborators, setCollaborators] = useState<Album["collaborators"]>(
    value.collaborators
  );
  const [viewers, setViewers] = useState<Album["viewers"]>(value.viewers);

  const { getImagesByIdFunction, getImagesByIdQueryKey, getImagesByIdOptions } =
    useRequests();
  const { data: images } = useQuery<ParseImage[], Error>(
    getImagesByIdQueryKey(imageIds),
    () => getImagesByIdFunction(imageIds, { showErrorsInSnackbar: true }),
    getImagesByIdOptions({
      refetchOnWindowFocus: false,
      enabled: open,
    })
  );

  const { getLoggedInUser } = useUserContext();
  const isCollaborator = useMemo(
    () => getLoggedInUser().id !== value.owner.id,
    [getLoggedInUser, value.owner.id]
  );

  const defaultErrors = useMemo(
    () => ({
      name: {
        isError: false,
        errorMessage: "",
      },
    }),
    []
  );
  const [errors, setErrors] = useState<ErrorState<"name">>(defaultErrors);

  const reinitialize = useCallback(() => {
    setName(value.name);
    setDescription(value.description);
    setIsFavorite(value.isFavorite);
    setCollaborators(value.collaborators);
    setViewers(value.viewers);
    setErrors(defaultErrors);
  }, [
    setName,
    setDescription,
    setIsFavorite,
    setCollaborators,
    setViewers,
    setErrors,
    value,
    defaultErrors,
  ]);
  const { enqueueErrorSnackbar } = useSnackbar();

  const classes = useStyles();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const { openConfirm } = useActionDialogContext();

  const validate = () => {
    const errors = defaultErrors;
    let valid = true;
    if (isNullOrWhitespace(name)) {
      errors.name = {
        isError: true,
        errorMessage: Strings.pleaseEnterA("name"),
      };
      valid = false;
    }
    let errorMessage = "";
    Object.values(errors).forEach((error) => {
      if (error.isError) {
        errorMessage += error.errorMessage + "\n";
      }
    });
    if (!valid) {
      setErrors(errors);
      enqueueErrorSnackbar(errorMessage);
    }
    return valid;
  };

  const handleConfirm = async () => {
    if (validate()) {
      const userEmails = new Set([...viewers, ...collaborators]);
      const signedUpUserCount = await new Parse.Query("User")
        .containedIn(ParseUser.COLUMNS.email, [...viewers, ...collaborators])
        .count();
      if (signedUpUserCount < userEmails.size) {
        openConfirm(Strings.nonExistentUserWarning(), async () => {
          await piHandleConfirm({
            ...value,
            images: imageIds,
            name,
            description,
            isFavorite,
            collaborators,
            viewers,
          });
        });
      } else {
        await piHandleConfirm({
          ...value,
          images: imageIds,
          name,
          description,
          isFavorite,
          collaborators,
          viewers,
        });
      }
      if (resetOnConfirm) {
        reinitialize();
      }
    }
  };

  const handleCancel = () => {
    reinitialize();
    piHandleCancel?.();
  };

  return (
    <ActionDialog
      fullScreen={sm}
      fullWidth
      maxWidth="lg"
      open={open}
      title={name ?? Strings.untitledAlbum()}
      message=""
      handleConfirm={handleConfirm}
      handleCancel={handleCancel}
      type="prompt"
      confirmButtonColor="success"
    >
      <Grid container direction="row">
        <Grid item xs={12}>
          <TextField
            error={errors.name.isError}
            helperText={errors.name.errorMessage}
            autoComplete="none"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            label={Strings.name()}
            id="name"
            type="text"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            autoComplete="none"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            label={Strings.description()}
            id="description"
            type="text"
            multiline
          />
        </Grid>
        {!isCollaborator && (
          <>
            <Grid item xs={12}>
              <Tooltip title={Strings.favoriteTooltip()}>
                <FormControl fullWidth className={classes.checkbox}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={isCollaborator}
                        icon={
                          <StarBorderIcon className={classes.favoriteIcon} />
                        }
                        checked={!!isFavorite}
                        onChange={(_, checked) => setIsFavorite(checked)}
                        checkedIcon={
                          <StarIcon className={classes.favoriteIcon} />
                        }
                      />
                    }
                    label={Strings.favorite()}
                    labelPlacement="start"
                    className={classes.checkboxLabel}
                  />
                </FormControl>
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Tooltip title={Strings.collaboratorsTooltip()}>
                <UserField
                  value={collaborators}
                  label={Strings.collaborators()}
                  onChange={(collaborators) => setCollaborators(collaborators)}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
              <Tooltip title={Strings.viewersTooltip()}>
                <UserField
                  value={viewers}
                  label={Strings.viewers()}
                  onChange={(viewers) => setViewers(viewers)}
                />
              </Tooltip>
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <ImageContextProvider>
            <ImageField
              label={Strings.images()}
              multiple
              value={images ?? []}
              onChange={async (newImages) => {
                const newImageIds = newImages.map((image) => image.id!);
                setImageIds(newImageIds);
              }}
            />
          </ImageContextProvider>
        </Grid>
      </Grid>
    </ActionDialog>
  );
};

export default AlbumFormDialog;
