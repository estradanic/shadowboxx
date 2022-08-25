import React, { useEffect, useMemo, useState } from "react";
import Parse from "parse";
import {
  Grid,
  Card,
  Button,
  FormControlLabel,
  Switch,
  FormControl,
} from "@material-ui/core";
import { Brightness7, Brightness2 } from "@material-ui/icons";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  PageContainer,
  ImageField,
  TextField,
  useSnackbar,
  FancyTypography,
} from "../../components";
import { Strings } from "../../resources";
import { ErrorState, validateEmail, isNullOrWhitespace } from "../../utils";
import {
  useUserContext,
  ImageContextProvider,
  useGlobalLoadingContext,
  useNetworkDetectionContext,
} from "../../contexts";
import { useView } from "../View";

const useStyles = makeStyles((theme: Theme) => ({
  cardTitle: {
    "& *": {
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
  const {
    getLoggedInUser,
    isUserLoggedIn,
    profilePicture,
    saveLoggedInUserUpdates,
  } = useUserContext();

  const { stopGlobalLoader, startGlobalLoader } = useGlobalLoadingContext();
  const { online } = useNetworkDetectionContext();

  const classes = useStyles();
  const [errors, setErrors] =
    useState<
      ErrorState<
        "email" | "firstName" | "lastName" | "password" | "profilePicture"
      >
    >(DefaultErrorState);
  const [settings, setSettings] = useState({
    isDarkThemeEnabled: !!getLoggedInUser().isDarkThemeEnabled,
    profilePicture,
    firstName: getLoggedInUser().firstName ?? "",
    lastName: getLoggedInUser().lastName ?? "",
    email: getLoggedInUser().email ?? "",
  });

  useEffect(() => {
    if (isUserLoggedIn) {
      setSettings({
        isDarkThemeEnabled: getLoggedInUser().isDarkThemeEnabled,
        firstName: getLoggedInUser().firstName,
        lastName: getLoggedInUser().lastName,
        email: getLoggedInUser().email,
        profilePicture,
      });
    }
  }, [getLoggedInUser, isUserLoggedIn, profilePicture]);

  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();

  const validate = (): boolean => {
    const newErrors = { ...DefaultErrorState };

    if (!validateEmail(settings.email)) {
      newErrors.email = {
        isError: true,
        errorMessage: Strings.invalidEmail(settings.email),
      };
    }
    if (isNullOrWhitespace(settings.firstName)) {
      newErrors.firstName = {
        isError: true,
        errorMessage: Strings.pleaseEnterA(Strings.firstName()),
      };
    }
    if (isNullOrWhitespace(settings.lastName)) {
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

  const changeUserInfo = async () => {
    if (validate()) {
      startGlobalLoader();
      getLoggedInUser().email = settings.email;
      getLoggedInUser().firstName = settings.firstName;
      getLoggedInUser().lastName = settings.lastName;
      getLoggedInUser().profilePicture = settings.profilePicture?.toPointer();
      getLoggedInUser().isDarkThemeEnabled = settings.isDarkThemeEnabled;
      try {
        await saveLoggedInUserUpdates();
        enqueueSuccessSnackbar(Strings.settingsSaved());
      } catch (error: any) {
        enqueueErrorSnackbar(error?.message ?? Strings.settingsNotSaved());
      } finally {
        stopGlobalLoader();
      }
    }
  };

  const profilePictureACL = useMemo(() => {
    const acl = new Parse.ACL(getLoggedInUser()._user);
    acl.setPublicReadAccess(true);
    return acl;
  }, [getLoggedInUser]);

  return (
    <PageContainer>
      <Grid item lg={6} sm={8}>
        <Card>
          <form autoComplete="off">
            <Grid container direction="row">
              <Grid className={classes.cardTitle} item xs={12}>
                <FancyTypography variant="h4">
                  {Strings.settings()}
                </FancyTypography>
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  disabled={!online}
                  fullWidth
                  className={classes.darkTheme}
                >
                  <FormControlLabel
                    disabled={!online}
                    control={
                      <Switch
                        disabled={!online}
                        classes={{
                          root: classes.switchRoot,
                          switchBase: classes.switchBase,
                          track: classes.switchTrack,
                          checked: classes.switchChecked,
                        }}
                        color="primary"
                        checked={settings.isDarkThemeEnabled}
                        onChange={(_, checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            isDarkThemeEnabled: checked,
                          }))
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
                    disabled={!online}
                    acl={profilePictureACL}
                    autoComplete="none"
                    value={
                      settings.profilePicture ? [settings.profilePicture] : []
                    }
                    onChange={async ([newProfilePicture]) =>
                      setSettings((prev) => ({
                        ...prev,
                        profilePicture: newProfilePicture,
                      }))
                    }
                    label={Strings.profilePicture()}
                  />
                </ImageContextProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={!online}
                  autoComplete="none"
                  error={errors.firstName.isError}
                  helperText={errors.firstName.errorMessage}
                  fullWidth
                  value={settings.firstName}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  label={Strings.firstName()}
                  id="firstName"
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={!online}
                  autoComplete="none"
                  error={errors.lastName.isError}
                  helperText={errors.lastName.errorMessage}
                  fullWidth
                  value={settings.lastName}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  label={Strings.lastName()}
                  id="lastName"
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={!online}
                  autoComplete="none"
                  error={errors.email.isError}
                  helperText={errors.email.errorMessage}
                  fullWidth
                  value={settings.email}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  label={Strings.email()}
                  id="email"
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  disabled={!online}
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
