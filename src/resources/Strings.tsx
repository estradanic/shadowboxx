import React, { ReactNode } from "react";

/**
 * Object providing dynamic access to strings used throughout the site.
 * Needed to avoid string literals for consistency.
 */
const Strings = {
  addAlbumError: () => `${Strings.commonError()}. Could not add album.`,
  addAlbumSuccess: (album: string) => `Successfully added album ${album}`,
  addFromFile: () => "Add from file",
  addFromLibrary: () => "Add from existing library",
  addFromUrl: () => "Add from URL",
  addOrEditCaption: () => "Add/Edit caption",
  addOrEditDate: () => "Add/Edit date",
  addToAlbum: () => "Add to album",
  albumChangeNotificationDetail: (userName: string, albumName: string) =>
    `${userName} changed ${albumName}`,
  albumChangeNotificationTitle: (count: number) =>
    `${count} album change${count > 1 ? "s" : ""} to see!`,
  albumNotFound: (album?: string) =>
    `Album not found${album ? ` (${album})` : ""}`,
  alreadyHaveAccount: () => "Already have an account?",
  appName: () => "Shadowboxx",
  aUser: () => "User",
  back: () => "Back",
  cancel: () => "Cancel",
  cantShare: () => "Something went wrong. Cannot share.",
  caption: () => "Caption",
  captionImage: () => "Caption Image",
  changePassword: () => "Change Password",
  collaborators: () => "Collaborators",
  collaboratorsTooltip: () =>
    "Users who will be allowed to add images to this album. (Enter email)",
  commonError: () => "Something went wrong!",
  commonSaved: () => "Saved!",
  confirm: () => "Confirm",
  copyright: () => `© Nicholas Estrada ${new Date().getFullYear()}`,
  couldNotGetDuplicates: () =>
    `${Strings.commonError()}. Could not get duplicates.`,
  couldNotGetUserInfo: () =>
    `${Strings.commonError()}. Could not get user info.`,
  couldNotResolveDuplicates: () =>
    `${Strings.commonError()}. Could not resolve duplicate images.`,
  createdAt: (createdAt: Date) => `Created: ${createdAt.toLocaleDateString()}`,
  darkMode: () => "Dark Mode",
  dateTaken: () => "Date Taken",
  dateImage: () => "Date Image",
  delete: () => "Delete",
  deleteAlbum: () => "Delete Album",
  deleteAlbumConfirmation: () =>
    "Are you sure? All pictures in this album will still be accessible on the 'My Pictures' page. This action is irreversible.",
  deleteAlbumError: () => `${Strings.commonError()} Could not delete album.`,
  deleteAlbumSuccess: () => "Album deleted successfully",
  deleteImagesConfirm: () => "Are you sure? This action is irreversible.",
  description: () => "Description",
  duplicatesNotificationTitle: () => "You may have uploaded duplicate images!",
  duplicatesNotificationDetail: (duplicatesNumber: number) =>
    `${duplicatesNumber} possible duplicate image${
      duplicatesNumber === 1 ? "" : "s"
    } found.`,
  editAlbum: () => "Edit Album",
  editAlbumError: () => `${Strings.commonError()}. Could not edit album.`,
  email: () => "Email",
  emailAlreadyVerified: () => "Email already verified",
  emailVerified: () => "Email Verified",
  enteringEditMode: () => "Edit Mode",
  firstName: () => "First Name",
  forgotPassword: () => "Forgot Password?",
  getImageError: () => `${Strings.commonError()} Could not get image.`,
  getImagesError: () => `${Strings.commonError()} Could not get images.`,
  goBack: () => "Go Back",
  goSee: () => "Go See",
  home: () => "Home",
  imageNotFound: (imageId?: string) =>
    `${Strings.commonError()} Image not found. Image Id: ${imageId}`,
  images: () => "Images",
  imageUrl: () => "Image URL",
  install: () => "Install App",
  installed: () => "Installed! :)",
  installPrompt: () => "Use Shadowboxx offline!",
  invalidEmail: (email: string) => `Invalid email${email ? ` (${email})` : ""}`,
  invalidEmptyFilename: () => "File name cannot be empty!",
  isDuplicate: () => "Are these images the same?",
  updatedAt: (updatedAt: Date) => `Edited: ${updatedAt.toLocaleDateString()}`,
  lastName: () => "Last Name",
  limitedOffline: () => "Offline functionality will be limited.",
  loadingSharedImages: () => "Loading selected images...",
  login: () => "Login",
  loginError: () => `${Strings.commonError()} Could not log in.`,
  logout: () => "Logout",
  loginSignup: () => "Login / Sign Up",
  multipleImages: () => "Multiple Images",
  name: () => "Name",
  noAccount: () => "Don't have an account?",
  noAlbums: () => "No Albums",
  noConnection: () => "No Internet Connection. Please try again later.",
  noImages: () => "No Images",
  noImagesSelected: () => "No images have been selected",
  nonExistentUserWarning: () =>
    `You are saving this album with at least one user that does not currently have a Shadowboxx account.
    This will open up access to your album to the first person who creates an account with that email.
    This may pose a privacy/security risk. Do you wish to continue?`,
  noNotifications: () => "You're all caught up! :)",
  notEnoughSpace: () => "Not enough storage space",
  notInstalled: () => "Not installed :(",
  numOfPhotos: (numOfPhotos: number) => `${numOfPhotos} photos.`,
  offline: () => "You are offline. Viewing mode only",
  okay: () => "Okay",
  password: () => "Password",
  passwordHelperText: () =>
    "Password must be at least 8 characters, contain a capital, lowercase, number, and special character",
  passwordChangeEmailSent: () =>
    "Please check your email for a password change link",
  pictures: () => "Pictures",
  pleaseEnterA: (field: string) => `Please enter a ${field}`,
  pleaseLogin: () => "Please login first",
  profilePicture: () => "Profile Picture",
  removeImage: () => "Remove image from album",
  resend: () => "Resend",
  resent: () => "Resent!",
  resetPassword: () => "Reset",
  resolve: () => "Resolve",
  resolveDuplicates: () => "Resolve Duplicates",
  processingImages: () => "Processing...",
  shareImage: () => "Share Image",
  selectImage: () => "Select Image",
  selectImages: () => "Select Images",
  sessionExpired: () => "Session Expired. Please log in again.",
  setImageAsCover: () => "Set this image as the album cover",
  settings: () => "Settings",
  settingsNotSaved: () => `${Strings.commonError()} Settings not saved.`,
  settingsSaved: () => "Settings saved successfully",
  shareTargetTitle: (num: number) =>
    `Select album to add ${num} image${num > 1 ? "s" : ""} to.`,
  signup: () => "Sign Up",
  signupError: () => `${Strings.commonError()} Could not sign up.`,
  submit: () => "Submit",
  timelineView: () => "Timeline View",
  tryAddingAlbum: () => "Try adding one below",
  undoEmailChange: () => "Changed your email address and want to go back?",
  undo: () => "Undo",
  unlockPassword: () => "Change Password",
  unsetCoverImage: () => "Unset this image as the album cover",
  untitledAlbum: () => "Untitled Album",
  uploadImageError: (fileName?: string) =>
    `Error uploading image${fileName ? ` ${fileName}` : ""}.`,
  uploadingImages: () => "Uploading...",
  verify: () => "Verify",
  verifyEmail: (email: ReactNode) => (
    <>
      Please check your email <br />
      <b>{email}</b>
      <br /> for the verification code.
    </>
  ),
  verifyEmailResend: () => "Didn't receive code?",
  verifyEmailTitle: () => "Verify Email",
  viewers: () => "Viewers",
  viewersTooltip: () =>
    "Users who will be allowed to view this album. (Enter email)",
} as const;

export default Strings;
