import React, { useEffect, useState } from "react";
import ActionDialog, {
  ActionDialogProps,
  useActionDialogContext,
} from "../Dialog/ActionDialog";
import Album from "../../types/Album";
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
import Parse from "parse";

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
  value: Parse.Object<Album>;
  /** Function to run when the confirm button is clicked */
  handleConfirm: (value: Parse.Object<Album>) => void;
  /** Whether to reset dialog state when confirm button is clicked */
  resetOnConfirm?: boolean;
}

/** Component to input values for creating or editing an Album */
const AlbumFormDialog = ({
  value,
  open,
  handleCancel: piHandleCancel,
  handleConfirm: piHandleConfirm,
  resetOnConfirm,
}: AlbumFormDialogProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const { enqueueErrorSnackbar } = useSnackbar();
  const { openConfirm } = useActionDialogContext();
  const initialAttributes = value.attributes;

  const defaultErrors = {
    name: {
      isError: false,
      errorMessage: "",
    },
  };
  const [errors, setErrors] = useState<ErrorState<"name">>(defaultErrors);

  const resetState = () => {
    value.set(initialAttributes);
    setErrors(defaultErrors);
  };

  const validate = () => {
    const errors = defaultErrors;
    let valid = true;
    if (isNullOrWhitespace(value.get("name"))) {
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

  const handleConfirm = () => {
    if (validate()) {
      const nonExistentCollaborators = [
        ...(value.get("viewers") ?? []),
        ...(value.get("collaborators") ?? []),
        ...(value.get("coOwners") ?? []),
      ].filter((collaborator) => collaborator.email === collaborator.firstName);
      if (!!nonExistentCollaborators.length) {
        openConfirm(
          Strings.nonExistentCollaboratorWarning(
            nonExistentCollaborators[0].email
          ),
          () => {
            piHandleConfirm(value);
          }
        );
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
      title={Strings.addAlbum()}
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
              value={value.get("name")}
              onChange={(e) => value.set({ name: e.target.value })}
              label={Strings.name()}
              id="name"
              type="text"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoComplete="none"
              fullWidth
              value={value.get("description")}
              onChange={(e) => value.set({ description: e.target.value })}
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
                      checked={value.get("isFavorite")}
                      onChange={(_, checked) =>
                        value.set({ isFavorite: checked })
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
                      checked={value.get("isPublic")}
                      onChange={(_, checked) =>
                        value.set({ isPublic: checked })
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
                value={value.get("coOwners")}
                label={Strings.coOwners()}
                onChange={(coOwners) => value.set({ coOwners })}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title={Strings.collaboratorsTooltip()}>
              <UserField
                value={value.get("collaborators")}
                label={Strings.collaborators()}
                onChange={(collaborators) => value.set({ collaborators })}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title={Strings.viewersTooltip()}>
              <UserField
                value={value.get("viewers")}
                label={Strings.viewers()}
                onChange={(viewers) => value.set({ viewers })}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <ImageField
              label={Strings.images()}
              multiple
              value={value.get("images")}
              onChange={(images) => value.set({ images })}
            />
          </Grid>
        </Grid>
      }
      confirmButtonColor="success"
    />
  );
};

export default AlbumFormDialog;
