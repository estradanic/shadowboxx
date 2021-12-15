import React, { useState } from "react";
import { useView } from "../View";
import {
  PageContainer,
  ImageField,
  TextField,
  useSnackbar,
} from "../../components";
import {
  Grid,
  Card,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
} from "@material-ui/core";
import { Brightness7, Brightness2 } from "@material-ui/icons";
import Strings from "../../resources/Strings";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { ErrorState, validateEmail } from "../../utils/formUtils";
import { isNullOrWhitespace } from "../../utils/stringUtils";
import { ImageContextProvider } from "../../app/ImageContext";
import { useUserContext } from "../../app/UserContext";

const useStyles = makeStyles((theme: Theme) => ({
  cardTitle: {
    "& *": {
      fontFamily: "Alex Brush",
      color: theme.palette.primary.contrastText,
      width: "fit-content",
      margin: "auto",
    },
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(2, 0),
  },
  submitButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    margin: "auto",
    borderRadius: 0,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  deleteAccountButton: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    margin: "auto",
    borderRadius: 0,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.error.dark,
    },
  },
  switchRoot: {
    marginLeft: "auto",
    marginRight: theme.spacing(0.5),
  },
  switchBase: {
    "&&": {
      paddingTop: theme.spacing(11 / 12),
      color: theme.palette.warning.light,
      "&$switchChecked + $switchTrack": {
        backgroundColor: theme.palette.primary.dark,
        opacity: 1,
      },
    },
  },
  switchChecked: {},
  switchTrack: {
    backgroundColor: theme.palette.primary.light,
    opacity: 1,
  },
  unlockPassword: {
    backgroundColor: theme.palette.warning.main,
    borderRadius: 0,
    "&:hover, &:focus, &:active": {
      backgroundColor: theme.palette.warning.dark,
    },
  },
  darkThemeLabel: {
    marginTop: theme.spacing(1.5),
    marginLeft: theme.spacing(1.5),
    marginRight: 0,
  },
  darkTheme: {
    height: theme.spacing(7),
    borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    "&:hover": {
      borderBottom: `1px solid ${theme.palette.text.primary}`,
    },
  },
}));

const DefaultErrorState = {
  email: { isError: false, errorMessage: "" },
  firstName: { isError: false, errorMessage: "" },
  lastName: { isError: false, errorMessage: "" },
  password: { isError: false, errorMessage: "" },
  profilePicture: { isError: false, errorMessage: "" },
};

/**
 * Settings page for the user.
 */
const Settings = () => {
  useView("Settings");
  const { loggedInUser, profilePicture } = useUserContext();

  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<
    ErrorState<
      "email" | "firstName" | "lastName" | "password" | "profilePicture"
    >
  >(DefaultErrorState);
  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();

  const validate = (): boolean => {
    const newErrors = { ...DefaultErrorState };

    if (!validateEmail(loggedInUser!.email)) {
      newErrors.email = {
        isError: true,
        errorMessage: Strings.invalidEmail(loggedInUser!.email),
      };
    }
    if (isNullOrWhitespace(loggedInUser!.firstName)) {
      newErrors.firstName = {
        isError: true,
        errorMessage: Strings.pleaseEnterA(Strings.firstName()),
      };
    }
    if (isNullOrWhitespace(loggedInUser!.lastName)) {
      newErrors.lastName = {
        isError: true,
        errorMessage: Strings.pleaseEnterA(Strings.firstName()),
      };
    }

    setErrors(newErrors);
    return !(
      newErrors.email.isError ||
      newErrors.firstName.isError ||
      newErrors.lastName.isError ||
      newErrors.password.isError ||
      newErrors.profilePicture.isError
    );
  };

  const changeUserInfo = () => {
    if (validate()) {
      setLoading(true);
      loggedInUser!
        .save()
        .then(() => {
          enqueueSuccessSnackbar(Strings.settingsSaved());
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          enqueueErrorSnackbar(error?.message ?? Strings.settingsNotSaved());
        });
    }
  };

  return (
    <PageContainer loading={loading}>
      <Grid item sm={8}>
        <Card>
          <form autoComplete="off">
            <Grid container direction="row">
              <Grid className={classes.cardTitle} item xs={12}>
                <Typography variant="h4">{Strings.settings()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth className={classes.darkTheme}>
                  <FormControlLabel
                    control={
                      <Switch
                        classes={{
                          root: classes.switchRoot,
                          switchBase: classes.switchBase,
                          track: classes.switchTrack,
                          checked: classes.switchChecked,
                        }}
                        color="primary"
                        checked={loggedInUser!.isDarkThemeEnabled}
                        onChange={(_, checked) =>
                          (loggedInUser!.isDarkThemeEnabled = checked)
                        }
                        icon={<Brightness7 />}
                        checkedIcon={<Brightness2 />}
                      />
                    }
                    label={Strings.darkMode()}
                    labelPlacement="start"
                    className={classes.darkThemeLabel}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <ImageContextProvider>
                  <ImageField
                    thumbnailOnly
                    autoComplete="none"
                    value={profilePicture ? [profilePicture] : []}
                    onChange={([newProfilePicture]) => {
                      loggedInUser!.set(
                        "profilePicture",
                        newProfilePicture.toPointer()
                      );
                    }}
                    label={Strings.profilePicture()}
                  />
                </ImageContextProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="none"
                  error={errors.firstName.isError}
                  helperText={errors.firstName.errorMessage}
                  fullWidth
                  value={loggedInUser!.firstName}
                  onChange={(e) => (loggedInUser!.firstName = e.target.value)}
                  label={Strings.firstName()}
                  id="firstName"
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="none"
                  error={errors.lastName.isError}
                  helperText={errors.lastName.errorMessage}
                  fullWidth
                  value={loggedInUser!.lastName}
                  onChange={(e) => (loggedInUser!.lastName = e.target.value)}
                  label={Strings.lastName()}
                  id="lastName"
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="none"
                  error={errors.email.isError}
                  helperText={errors.email.errorMessage}
                  fullWidth
                  value={loggedInUser!.email}
                  onChange={(e) => (loggedInUser!.email = e.target.value)}
                  label={Strings.email()}
                  id="email"
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  className={classes.submitButton}
                  size="large"
                  onClick={changeUserInfo}
                >
                  {Strings.submit()}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Grid>
    </PageContainer>
  );
};

export default Settings;
