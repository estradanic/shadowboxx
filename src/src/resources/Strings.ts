export interface StringEntries {
  accountNotDeleted: string;
  actionUnauthorized: string;
  addAlbum: string;
  addAlbumError: string;
  addAlbumSuccess: string;
  addFromFile: string;
  addFromUrl: string;
  albumNotFound: string;
  alreadyHaveAccount: string;
  appName: string;
  back: string;
  cancel: string;
  checkEmailVerified: string;
  collaborators: string;
  collaboratorsTooltip: string;
  commonError: string;
  confirm: string;
  copyright: string;
  couldNotGetCollaborators: string;
  couldNotGetUserInfo: string;
  couldNotWriteImage: string;
  createdAt: string;
  darkMode: string;
  deleteAccount: string;
  deleteAccountConfirmation: string;
  deleteAlbum: string;
  deleteAlbumConfirmation: string;
  deleteAlbumError: string;
  deleteAlbumSuccess: string;
  deleteDirectoryError: string;
  description: string;
  dragOrBrowse: string;
  editAlbum: string;
  editAlbumError: string;
  email: string;
  emailExists: string;
  endpointNotFound: string;
  favorite: string;
  favoriteTooltip: string;
  firstName: string;
  fullName: string;
  getAlbumError: string;
  getAlbumsError: string;
  getImageError: string;
  getImagesError: string;
  goBack: string;
  home: string;
  imageNotDeleted: string;
  imageNotSaved: string;
  imageNotUpdated: string;
  images: string;
  imageUrl: string;
  incorrectPassword: string;
  insertCollaboratorsError: string;
  invalidEmail: string;
  invalidImage: string;
  invalidPassword: string;
  updatedAt: string;
  lastName: string;
  login: string;
  loginError: string;
  logout: string;
  loginSignup: string;
  multipleImages: string;
  name: string;
  newPassword: string;
  noAccount: string;
  noAlbumId: string;
  noAlbums: string;
  noEmailExists: string;
  noImageExists: string;
  noImages: string;
  nonExistentUserWarning: string;
  noNotifications: string;
  noNotificationsDetail: string;
  noSessionId: string;
  numOfPhotos: string;
  okay: string;
  password: string;
  pictures: string;
  pleaseEnterA: string;
  profilePicture: string;
  public: string;
  publicTooltip: string;
  removeImage: string;
  removeImageError: string;
  setImageAsCover: string;
  settings: string;
  settingsNotSaved: string;
  settingsSaved: string;
  signup: string;
  signupError: string;
  submit: string;
  tryAddingAlbum: string;
  unlockPassword: string;
  unsetCoverImage: string;
  untitledAlbum: string;
  updateImageError: string;
  uploadImageError: string;
  uploadingImage: string;
  uploadingImages: string;
  verifyEmail: string;
  viewers: string;
  viewersTooltip: string;
  welcomeUser: string;
  wrongSessionId: string;
}

/**
 * Object providing dynamic access to strings used throughout the site.
 * Needed to avoid string literals for consistency.
 */
const Strings: {
  [key in keyof StringEntries]: (...params: any[]) => string;
} = {
  accountNotDeleted: () => `${Strings.commonError()} Could not delete account.`,
  actionUnauthorized: () => "Action Unauthorized",
  addAlbum: () => "Add Album",
  addAlbumError: () => `${Strings.commonError()}. Could not add album.`,
  addAlbumSuccess: (album: string) => `Successfully added album ${album}`,
  addFromFile: () => "Add from file",
  addFromUrl: () => "Add from URL",
  albumNotFound: (album: string) =>
    `Album not found${album ? ` (${album})` : ""}`,
  alreadyHaveAccount: () => "Already have an account?",
  appName: () => "Shadowbox",
  back: () => "Back",
  cancel: () => "Cancel",
  checkEmailVerified: () => "Check Verification Status",
  collaborators: () => "Collaborators",
  collaboratorsTooltip: () =>
    "Users who will be allowed to add images to this album. (Enter email)",
  commonError: () => "Something went wrong!",
  confirm: () => "Confirm",
  copyright: () => `© Nicholas Estrada ${new Date().getFullYear()}`,
  couldNotGetCollaborators: () =>
    `${Strings.commonError()}. Could not get collaborators.`,
  couldNotGetUserInfo: () =>
    `${Strings.commonError()}. Could not get user info.`,
  couldNotWriteImage: (fileName: string) =>
    `Could not write image (${fileName})`,
  createdAt: (createdAt: Date) => `Created: ${createdAt.toLocaleDateString()}`,
  darkMode: () => "Dark Mode",
  deleteAccount: () => "Delete Account",
  deleteAccountConfirmation: () =>
    "Are you sure? This action is irreversible. All your photos and information will be deleted.",
  deleteAlbum: () => "Delete Album",
  deleteAlbumConfirmation: () =>
    "Are you sure? All pictures in this album will still be accessible on the 'My Pictures' page. This action is irreversible.",
  deleteAlbumError: () => `${Strings.commonError()} Could not delete album.`,
  deleteAlbumSuccess: () => "Album deleted successfully",
  deleteDirectoryError: (directory: string) =>
    `Could not delete directory ${directory}`,
  description: () => "Description",
  dragOrBrowse: (what: string) => `Drag ${what} here or click to browse`,
  editAlbum: () => "Edit Album",
  editAlbumError: () => `${Strings.commonError()}. Could not edit album.`,
  email: () => "Email",
  emailExists: (email: string) => `User with email already exists (${email})`,
  endpointNotFound: (endpoint: string) =>
    `404. Endpoint not found (${endpoint})`,
  favorite: () => "Favorite",
  favoriteTooltip: () => "Album will appear at the top of your Home page",
  firstName: () => "First Name",
  fullName: () => "Full Name",
  getAlbumError: () => `${Strings.commonError()} Could not get album.`,
  getAlbumsError: () => `${Strings.commonError()} Could not get albums.`,
  getImageError: () => `${Strings.commonError()} Could not get image.`,
  getImagesError: () => `${Strings.commonError()} Could not get images.`,
  goBack: () => "Go Back",
  home: () => "Home",
  imageNotDeleted: (image: string) =>
    `Image not deleted ${JSON.stringify(image)}`,
  imageNotSaved: () => `${Strings.commonError()} Image not saved`,
  imageNotUpdated: () => `${Strings.commonError()} Image not updated`,
  images: () => "Images",
  imageUrl: () => "Image URL",
  incorrectPassword: () => "Incorrect password",
  insertCollaboratorsError: () => "Error inserting collaborators",
  invalidEmail: (email: string) => `Invalid email (${email})`,
  invalidImage: (image: { src: string; fileName: string }) =>
    `Invalid image (${(image && JSON.stringify(image)) || image})`,
  invalidPassword: (password: string) => `Invalid password (${password})`,
  updatedAt: (updatedAt: Date) => `Edited: ${updatedAt.toLocaleDateString()}`,
  lastName: () => "Last Name",
  login: () => "Login",
  loginError: () => `${Strings.commonError()} Could not log in.`,
  logout: () => "Logout",
  loginSignup: () => "Login / Sign Up",
  multipleImages: () => "Multiple Images",
  name: () => "Name",
  newPassword: () => "New Password",
  noAccount: () => "Don't have an account?",
  noAlbumId: () => "No album id provided.",
  noAlbums: () => "No Albums",
  noEmailExists: (email: string) => `Email doesn't exist (${email})`,
  noImageExists: (fileName: string) => `Image doesn't exist (${fileName})`,
  noImages: () => "This album is empty",
  nonExistentUserWarning: () =>
    `You are saving this album with at least one user that does not currently have a Shadowbox account.
    This will open up access to your album to the first person who creates an account with that email.
    This may pose a privacy/security risk. Do you wish to continue?`,
  noNotifications: () => "You're all caught up! :)",
  noNotificationsDetail: () => "No Notifications",
  noSessionId: () => "No session id provided",
  numOfPhotos: (numOfPhotos: number) => `${numOfPhotos} photos.`,
  okay: () => "Okay",
  password: () => "Password",
  pictures: () => "Pictures",
  pleaseEnterA: (field: string) => `Please enter a ${field}`,
  profilePicture: () => "Profile Picture",
  public: () => "Public",
  publicTooltip: () =>
    "Should this album be viewable by stringone with a link? (Overrides Viewers)",
  removeImage: () => "Remove image from album",
  removeImageError: (fileName: string) =>
    `Could not remove image ${fileName} from album.`,
  setImageAsCover: () => "Set this image as the album cover",
  settings: () => "Settings",
  settingsNotSaved: () => `${Strings.commonError()} Settings not saved.`,
  settingsSaved: () => "Settings saved successfully",
  signup: () => "Sign Up",
  signupError: () => `${Strings.commonError()} Could not sign up.`,
  submit: () => "Submit",
  tryAddingAlbum: () => "Try adding one below",
  unlockPassword: () => "Change Password",
  unsetCoverImage: () => "Unset this image as the album cover",
  untitledAlbum: () => "Untitled Album",
  updateImageError: (fileName: string) => `Error updating image ${fileName}.`,
  uploadImageError: (fileName: string) => `Error uploading image ${fileName}.`,
  uploadingImage: (fileName: string) => `Uploading image (${fileName})`,
  uploadingImages: () => "Uploading images...",
  verifyEmail: (email: string) =>
    `Please check ${email} for the verification message, then return here.`,
  viewers: () => "Viewers",
  viewersTooltip: () =>
    "Users who will be allowed to view this album. (Enter email)",
  welcomeUser: (name: { firstName: string; lastName: string }) =>
    `Welcome, ${name.firstName} ${name.lastName}!`,
  wrongSessionId: () => "Wrong session id or session id has expired",
};

export default Strings;
