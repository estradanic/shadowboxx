import React, { useEffect, useState } from "react";
import ActionDialog, {
  ActionDialogProps,
  useActionDialogContext,
} from "../Dialog/ActionDialog";
import { Album } from "../../types/Album";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Strings from "../../resources/Strings";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import { ErrorState } from "../../utils/formUtils";
import { Public, Star, StarBorder } from "@material-ui/icons";
import { isNullOrWhitespace } from "../../utils/stringUtils";
import ImageField from "../Field/ImageField";
import { useSnackbar } from "../Snackbar/Snackbar";
import UserField from "../Field/UserField";
import TextField from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";
import { ImageContextProvider } from "../../app/ImageContext";
import ParseUser from "../../types/User";
import ParseImage from "../../types/Image";

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
  const [value, setValue] = useState<Album>(initialValue);
  const [images, setImages] = useState<ParseImage[]>([]);

  useEffect(() => {
    ParseImage.query()
      .containedIn(ParseImage.COLUMNS.id, value.images)
      .findAll()
      .then((response) => {
        setImages(response.map((image) => new ParseImage(image)));
      });
  }, [value.images]);

  const classes = useStyles();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const { enqueueErrorSnackbar } = useSnackbar();
  const { openConfirm } = useActionDialogContext();

  const defaultErrors = {
    name: {
      isError: false,
      errorMessage: "",
    },
  };
  const [errors, setErrors] = useState<ErrorState<"name">>(defaultErrors);

  const resetState = () => {
    setValue(initialValue);
    setErrors(defaultErrors);
  };

  const validate = () => {
    const errors = defaultErrors;
    let valid = true;
    if (isNullOrWhitespace(value.name)) {
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
      const valueUsers = new Set([
        ...value.viewers,
        ...value.collaborators,
        ...value.coOwners,
      ]);
      const existingUserCount = await new Parse.Query("User")
        .containedIn(ParseUser.COLUMNS.email, [
          ...value.viewers,
          ...value.collaborators,
          ...value.coOwners,
        ])
        .count();
      if (existingUserCount < valueUsers.size) {
        openConfirm(Strings.nonExistentUserWarning(), () => {
          piHandleConfirm(value);
        });
      } else {
        piHandleConfirm(value);
      }
      if (resetOnConfirm) {
        resetState();
      }
    }
  };

  const handleCancel = () => {
    resetState();
    piHandleCancel?.();
  };

  return (
    <ActionDialog
      fullScreen={sm}
      fullWidth
      maxWidth="lg"
      open={open}
      title={value.name ?? Strings.untitledAlbum()}
      message=""
      handleConfirm={handleConfirm}
      handleCancel={handleCancel}
      type="prompt"
      promptField={
        <Grid container direction="row">
          <Grid item xs={12}>
            <TextField
              error={errors.name.isError}
              helperText={errors.name.errorMessage}
              autoComplete="none"
              fullWidth
              value={value.name}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, name: e.target.value }))
              }
              label={Strings.name()}
              id="name"
              type="text"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoComplete="none"
              fullWidth
              value={value.description}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, description: e.target.value }))
              }
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
                      checked={!!value.isFavorite}
                      onChange={(_, checked) =>
                        setValue((prev) => ({ ...prev, isFavorite: checked }))
                      }
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
                      checked={!!value.isPublic}
                      onChange={(_, checked) =>
                        setValue((prev) => ({ ...prev, isPublic: checked }))
                      }
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
                value={value.coOwners}
                label={Strings.coOwners()}
                onChange={(coOwners) =>
                  setValue((prev) => ({
                    ...prev,
                    coOwners,
                  }))
                }
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title={Strings.collaboratorsTooltip()}>
              <UserField
                value={value.collaborators}
                label={Strings.collaborators()}
                onChange={(collaborators) =>
                  setValue((prev) => ({
                    ...prev,
                    collaborators,
                  }))
                }
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title={Strings.viewersTooltip()}>
              <UserField
                value={value.viewers}
                label={Strings.viewers()}
                onChange={(viewers) =>
                  setValue((prev) => ({
                    ...prev,
                    viewers,
                  }))
                }
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
                  setValue((prev) => ({
                    ...prev,
                    images: images.map((image) => image.id!),
                  }))
                }
              />
            </ImageContextProvider>
          </Grid>
        </Grid>
      }
      confirmButtonColor="success"
    />
  );
};

export default AlbumFormDialog;
