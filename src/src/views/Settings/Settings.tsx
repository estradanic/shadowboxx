import React, { useEffect, useState } from "react";
import { useView } from "../View";
import {
  PageContainer,
  PasswordField,
  ImageField,
  ActionDialog,
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
  ClickAwayListener,
} from "@material-ui/core";
import { Brightness7, Brightness2, Lock, LockOpen } from "@material-ui/icons";
import { ParseFile, useUserContext } from "../../app/UserContext";
import Strings from "../../resources/Strings";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { isEqual } from "lodash";
import {
  ErrorState,
  validateEmail,
  validatePassword,
} from "../../utils/formUtils";
import { isNullOrWhitespace } from "../../utils/stringUtils";
import md5 from "md5";
import Parse from "parse";

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

  const classes = useStyles();
  const {
    firstName: globalFirstName,
    lastName: globalLastName,
    email: globalEmail,
    profilePicture: globalProfilePicture,
    setFirstName: setGlobalFirstName,
    setLastName: setGlobalLastName,
    setEmail: setGlobalEmail,
    setProfilePicture: setGlobalProfilePicture,
    isDarkThemeEnabled: globalDarkThemeEnabled,
    setDarkThemeEnabled: setGlobalDarkThemeEnabled,
  } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>(globalFirstName);
  const [lastName, setLastName] = useState<string>(globalLastName);
  const [email, setEmail] = useState<string>(globalEmail);
  const [profilePicture, setProfilePicture] = useState<ParseFile>(
    globalProfilePicture
  );
  const [isDarkThemeEnabled, setIsDarkThemeEnabled] = useState<boolean>(
    globalDarkThemeEnabled
  );
  const [passwordUnlocked, setPasswordUnlocked] = useState<boolean>(false);
  const [hoveringUnlockPassword, setHoveringUnlockPassword] = useState<boolean>(
    false
  );
  const [errors, setErrors] = useState<
    ErrorState<
      "email" | "firstName" | "lastName" | "password" | "profilePicture"
    >
  >(DefaultErrorState);
  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();

  useEffect(() => {
    setFirstName(globalFirstName);
    setLastName(globalLastName);
    setEmail(globalEmail);
    setProfilePicture(globalProfilePicture);
    setIsDarkThemeEnabled(globalDarkThemeEnabled);
    // Only rerun when global values change.
    // Eslint is being over-protective here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    globalFirstName,
    globalLastName,
    globalEmail,
    globalProfilePicture,
    globalDarkThemeEnabled,
  ]);

  const validate = (): boolean => {
    const newErrors = { ...DefaultErrorState };

    if (!validateEmail(email)) {
      newErrors.email = {
        isError: true,
        errorMessage: Strings.invalidEmail(email),
      };
    }
    if (password && !validatePassword(password)) {
      newErrors.password = {
        isError: true,
        errorMessage: Strings.invalidPassword(password),
      };
    }
    if (isNullOrWhitespace(firstName)) {
      newErrors.firstName = {
        isError: true,
        errorMessage: Strings.pleaseEnterA(Strings.firstName()),
      };
    }
    if (isNullOrWhitespace(lastName)) {
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
      const newInfo: Parse.Attributes = {
        firstName,
        lastName,
        password: password ? md5(password) : "",
        isDarkThemeEnabled,
      };
      if (
        // compare images without parseFile being
        !isEqual(
          { ...profilePicture, parseFile: null },
          { ...globalProfilePicture, parseFile: null }
        )
      ) {
        newInfo.profilePicture = profilePicture;
      }
      if (email !== globalEmail) {
        newInfo.email = email;
      }
      setLoading(true);
      Parse.User.current()?.set(newInfo);
      Parse.User.current()
        ?.save()
        .then((response) => {
          setGlobalEmail(response.getEmail() ?? "");
          setGlobalFirstName(response.get("firstName"));
          setGlobalLastName(response.get("lastName"));
          if (response.get("profilePicture")) {
            setGlobalProfilePicture(
              response.get("profilePicture") ?? { src: "", name: "" }
            );
          }
          setGlobalDarkThemeEnabled(
            response.get("isDarkThemeEnabled") ?? false
          );
          setPasswordUnlocked(false);
          enqueueSuccessSnackbar(Strings.settingsSaved());
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          enqueueErrorSnackbar(error?.message ?? Strings.settingsNotSaved());
        });
    }
  };

  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [promptPassword, setPromptPassword] = useState("");
  const deleteAccount = () => {
    if (promptPassword) {
      Parse.User.current()
        ?.destroy()
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          setLoading(false);
          enqueueErrorSnackbar(error?.message ?? Strings.commonError());
        });
    } else {
      enqueueErrorSnackbar(Strings.invalidPassword());
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
                        checked={isDarkThemeEnabled}
                        onChange={(_, checked) =>
                          setIsDarkThemeEnabled(checked)
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
                <ImageField
                  thumbnailOnly
                  autoComplete="none"
                  value={[profilePicture]}
                  onChange={([profilePicture]) => {
                    setProfilePicture(profilePicture);
                  }}
                  label={Strings.profilePicture()}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="none"
                  error={errors.firstName.isError}
                  helperText={errors.firstName.errorMessage}
                  fullWidth
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label={Strings.email()}
                  id="email"
                  type="email"
                />
              </Grid>
              <ClickAwayListener
                onClickAway={() => {
                  if (!password) {
                    setPasswordUnlocked(false);
                  }
                }}
              >
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    className={classes.unlockPassword}
                    size="small"
                    onClick={() => setPasswordUnlocked(true)}
                    style={{ display: passwordUnlocked ? "none" : "inherit" }}
                    onMouseEnter={() => setHoveringUnlockPassword(true)}
                    onMouseLeave={() => setHoveringUnlockPassword(false)}
                    startIcon={hoveringUnlockPassword ? <LockOpen /> : <Lock />}
                  >
                    {Strings.unlockPassword()}
                  </Button>
                  <PasswordField
                    style={{ display: passwordUnlocked ? "inherit" : "none" }}
                    autoComplete="new-password"
                    error={errors.password.isError}
                    helperText={errors.password.errorMessage}
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label={Strings.newPassword()}
                    id="password"
                  />
                </Grid>
              </ClickAwayListener>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  className={classes.deleteAccountButton}
                  size="large"
                  onClick={() => setDeleteAccountDialogOpen(true)}
                >
                  {Strings.deleteAccount()}
                </Button>
                <ActionDialog
                  open={deleteAccountDialogOpen}
                  title={Strings.deleteAccount()}
                  message={Strings.deleteAccountConfirmation()}
                  handleCancel={() => {
                    setPromptPassword("");
                    setDeleteAccountDialogOpen(false);
                  }}
                  handleConfirm={deleteAccount}
                  confirmButtonColor="error"
                  promptField={
                    <PasswordField
                      fullWidth
                      label={Strings.password()}
                      onChange={(event) =>
                        setPromptPassword(event.target.value)
                      }
                      value={promptPassword}
                    />
                  }
                  type="prompt"
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
