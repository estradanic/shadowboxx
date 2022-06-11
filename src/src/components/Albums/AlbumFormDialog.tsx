import React, { useCallback, useEffect, useMemo, useState } from "react";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import { Public, Star, StarBorder } from "@material-ui/icons";
import { Strings } from "../../resources";
import { ErrorState, isNullOrWhitespace } from "../../utils";
import { ImageContextProvider } from "../../contexts";
import { ParseUser, ParseImage, Album } from "../../types";
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
  publicIcon: {
    marginLeft: "auto",
    marginRight: theme.spacing(1.5),
    color: theme.palette.text.disabled,
  },
  publicIconChecked: {
    marginLeft: "auto",
    color: theme.palette.success.main,
    marginRight: theme.spacing(1.5),
  },
}));

/** Interface defining props for AlbumFormDialog */
export interface AlbumFormDialogProps
  extends Pick<ActionDialogProps, "open" | "handleCancel"> {
  /** Value for the component */
  value: Album;
  /** Function to run when the confirm button is clicked */
  handleConfirm: (value: Album) => void;
  /** Whether to reset dialog state when confirm button is clicked */
  resetOnConfirm?: boolean;
}

/** Component to input values for creating or editing an Album */
const AlbumFormDialog = ({
  value: initialValue,
  open,
  handleCancel: piHandleCancel,
  handleConfirm: piHandleConfirm,
  resetOnConfirm,
}: AlbumFormDialogProps) => {
  const [imageIds, setImageIds] = useState<Album["images"]>(
    initialValue.images
  );
  const [name, setName] = useState<Album["name"]>(initialValue.name);
  const [description, setDescription] = useState<Album["description"]>(
    initialValue.description
  );
  const [isFavorite, setIsFavorite] = useState<Album["isFavorite"]>(
    initialValue.isFavorite
  );
  const [isPublic, setIsPublic] = useState<Album["isPublic"]>(
    initialValue.isPublic
  );
  const [collaborators, setCollaborators] = useState<Album["collaborators"]>(
    initialValue.collaborators
  );
  const [viewers, setViewers] = useState<Album["viewers"]>(
    initialValue.viewers
  );
  const [coOwners, setCoOwners] = useState<Album["coOwners"]>(
    initialValue.coOwners
  );

  const [images, setImages] = useState<ParseImage[]>([]);

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
    setName(initialValue.name);
    setDescription(initialValue.description);
    setIsFavorite(initialValue.isFavorite);
    setIsPublic(initialValue.isPublic);
    setCollaborators(initialValue.collaborators);
    setViewers(initialValue.viewers);
    setCoOwners(initialValue.coOwners);
    setErrors(defaultErrors);
  }, [
    setName,
    setDescription,
    setIsFavorite,
    setIsPublic,
    setCollaborators,
    setViewers,
    setCoOwners,
    setErrors,
    initialValue,
    defaultErrors,
  ]);

  useEffect(() => {
    ParseImage.query()
      .containedIn(ParseImage.COLUMNS.id, imageIds)
      .findAll()
      .then((response) => {
        setImages(response.map((image) => new ParseImage(image)));
      });
  }, [imageIds]);

  useEffect(() => {
    reinitialize();
  }, [initialValue, reinitialize]);

  const classes = useStyles();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const { enqueueErrorSnackbar } = useSnackbar();
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
      const userEmails = new Set([...viewers, ...collaborators, ...coOwners]);
      const signedUpUserCount = await new Parse.Query("User")
        .containedIn(ParseUser.COLUMNS.email, [
          ...viewers,
          ...collaborators,
          ...coOwners,
        ])
        .count();
      if (signedUpUserCount < userEmails.size) {
        openConfirm(Strings.nonExistentUserWarning(), () => {
          piHandleConfirm({
            ...initialValue,
            images: imageIds,
            name,
            description,
            isFavorite,
            isPublic,
            collaborators,
            viewers,
            coOwners,
          });
        });
      } else {
        piHandleConfirm({
          ...initialValue,
          images: imageIds,
          name,
          description,
          isFavorite,
          isPublic,
          collaborators,
          viewers,
          coOwners,
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
        <Grid item xs={12}>
          <Tooltip title={Strings.favoriteTooltip()}>
            <FormControl fullWidth className={classes.checkbox}>
              <FormControlLabel
                control={
                  <Checkbox
                    icon={<StarBorder className={classes.favoriteIcon} />}
                    checked={!!isFavorite}
                    onChange={(_, checked) => setIsFavorite(checked)}
                    checkedIcon={<Star className={classes.favoriteIcon} />}
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
          <Tooltip title={Strings.publicTooltip()}>
            <FormControl fullWidth className={classes.checkbox}>
              <FormControlLabel
                control={
                  <Checkbox
                    icon={<Public className={classes.publicIcon} />}
                    checked={!!isPublic}
                    onChange={(_, checked) => setIsPublic(checked)}
                    checkedIcon={
                      <Public className={classes.publicIconChecked} />
                    }
                  />
                }
                label={Strings.public()}
                labelPlacement="start"
                className={classes.checkboxLabel}
              />
            </FormControl>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title={Strings.coOwnersTooltip()}>
            <UserField
              value={coOwners}
              label={Strings.coOwners()}
              onChange={(coOwners) => setCoOwners(coOwners)}
            />
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
        <Grid item xs={12}>
          <ImageContextProvider>
            <ImageField
              label={Strings.images()}
              multiple
              value={images}
              onChange={(images) =>
                setImageIds(images.map((image) => image.id!))
              }
            />
          </ImageContextProvider>
        </Grid>
      </Grid>
    </ActionDialog>
  );
};

export default AlbumFormDialog;
