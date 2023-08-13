/**
 * Object providing dynamic access to strings used throughout the site.
 * Needed to avoid string literals for consistency.
 */
const Strings = {
  error: {
    gettingTags: "Error getting tags",
    verifyingEmail: "Error verifying email",
    resendingVerificationEmail: "Error resending verification email",
    undoingEmailChange: "Error undoing email change",
    addingAlbum: "Error adding album",
    sharingImage: "Error sharing image",
    gettingDuplicates: "Error getting duplicates",
    gettingImageUrl: "Error getting image url",
    gettingUserInfo: "Error getting user info",
    resolvingDuplicates: "Error resolving duplicates",
    deletingAlbum: (name: string) => `Error deleting album ${name}`,
    deletingImage: (fileName?: string) =>
      `Error deleting image${fileName ? ` ${fileName}` : ""}`,
    editingAlbum: "Error editing album",
    gettingImage: "Error getting image",
    gettingImages: "Error getting images",
    loggingIn: "Error logging in",
    savingSettings: "Error saving settings",
    signingUp: "Error signing up",
    uploadingImage: (fileName?: string) =>
      `Error uploading image${fileName ? ` ${fileName}` : ""}.`,
    imageNotFound: (imageId?: string) => `Image ${imageId} not found`,
    albumNotFound: (album?: string) =>
      `Album not found${album ? ` (${album})` : ""}`,
    invalidEmail: (email: string) =>
      `Invalid email${email ? ` (${email})` : ""}`,
    invalidEmptyFilename: "File name cannot be empty!",
    noConnection: "No Internet Connection. Please try again later",
    notInstalled: "Not installed :(",
    common: "Something went wrong!",
    fileTooLarge: (fileName?: string) =>
      `File${fileName ? ` ${fileName}` : ""} is too large`,
    invalidFileType: (fileName?: string) =>
      `Invalid file type${fileName ? ` ${fileName}` : ""}`,
    processingFile: (fileName?: string) =>
      `Error processing file${fileName ? ` ${fileName}` : ""}`,
  },
  success: {
    common: "Success!",
    saved: "Saved!",
    addingAlbum: (album: string) => `Successfully added album ${album}`,
    deletingAlbum: (album: string) => `Successfully deleted album ${album}`,
    installed: "Installed! :)",
    savingSettings: "Successfully saved settings",
    emailVerified: "Email Verified",
    resent: "Resent!",
  },
  action: {
    verify: "Verify",
    addFromFile: "Add from file",
    addFromLibrary: "Add from existing library",
    addFromUrl: "Add from URL",
    addOrEditCaption: "Add/Edit caption",
    addOrRemoveTags: "Add/Remove tags",
    addOrEditDate: "Add/Edit date",
    addToAlbum: "Add to album",
    back: "Back",
    cancel: "Cancel",
    captionImage: "Caption Image",
    changePassword: "Change Password",
    confirm: "Confirm",
    dateImage: "Date Image",
    delete: "Delete",
    deleteAlbum: "Delete Album",
    editAlbum: "Edit Album",
    goBack: "Go Back",
    goSee: "Take me there!",
    install: "Install App",
    login: "Login",
    logout: "Logout",
    loginSignup: "Login / Sign Up",
    okay: "Okay",
    resend: "Resend",
    resolve: "Resolve",
    resolveDuplicates: "Resolve Duplicates",
    shareImage: "Share Image",
    selectImage: "Select Image",
    selectImages: "Select Images",
    removeImage: "Remove image from album",
    resetPassword: "Reset",
    signup: "Sign Up",
    submit: "Submit",
    undo: "Undo",
    unlockPassword: "Change Password",
    unsetCoverImage: "Unset this image as the album cover",
    setImageAsCover: "Set this image as the album cover",
    tagImage: "Tag Image",
  },
  message: {
    uploading: (fileName: string) => `Uploading ${fileName}`,
    processing: (fileName: string) => `Processing ${fileName}`,
    uploaded: (fileName: string) => `Uploaded ${fileName}`,
    loadingSharedImages: "Loading selected images...",
    shareTargetTitle: (num: number) =>
      `Select album to add ${num} image${num > 1 ? "s" : ""} to.`,
    sessionExpired: "Session Expired. Please log in again.",
    albumChangeNotificationDetail: (userName: string, albumName: string) =>
      `${userName} changed ${albumName}`,
    albumChangeNotificationTitle: (count: number) =>
      `${count} album change${count > 1 ? "s" : ""} to see!`,
    deleteAlbumConfirmation:
      "Are you sure? All memories in this album will still be accessible on the 'Memories' page. This action is irreversible.",
    deleteImagesConfirm: "Are you sure? This action is irreversible.",
    duplicatesNotificationTitle: "You may have uploaded duplicate images!",
    duplicatesNotificationDetail: (duplicatesNumber: number) =>
      `${duplicatesNumber} possible duplicate image${
        duplicatesNumber === 1 ? "" : "s"
      } found.`,
    emailAlreadyVerified: "Email already verified",
    limitedOffline: "Offline functionality will be limited.",
    noAlbums: "No Albums",
    noImages: "No Images",
    noImagesSelected: "No images have been selected",
    nonExistentUserWarning: `You are saving this album with at least one user that does not currently have a Shadowboxx account.
      This will open up access to your album to the first person who creates an account with that email.
      This may pose a privacy/security risk. Do you wish to continue?`,
    noNotifications: "You're all caught up! :)",
    notEnoughSpace: "Not enough storage space",
    offline: "You are offline. Viewing mode only",
    passwordHelperText:
      "Password must be at least 8 characters, contain a capital, lowercase, number, and special character",
    passwordChangeEmailSent:
      "Please check your email for a password change link",
    pleaseLogin: "Please login first",
    verifyEmail: (email: string) =>
      `Please check your email ${email} for the verification code`,
  },
  label: {
    tags: "Tags",
    tagSearch: "Tag Search",
    caption: "Caption",
    captionSearch: "Caption Search",
    appName: "Shadowboxx",
    aUser: "User",
    collaborators: "Collaborators",
    collaboratorsTooltip:
      "Users who will be allowed to add images to this album. (Enter email)",
    createdAt: (createdAt: Date) =>
      `Created: ${createdAt.toLocaleDateString()}`,
    darkMode: "Dark Mode",
    dateTaken: "Date Taken",
    description: "Description",
    email: "Email",
    editMode: "Edit Mode",
    firstName: "First Name",
    home: "Home",
    images: "Images",
    imageUrl: "Image URL",
    updatedAt: (updatedAt: Date) => `Edited: ${updatedAt.toLocaleDateString()}`,
    lastName: "Last Name",
    multipleImages: "Multiple Images",
    name: "Name",
    numOfMemories: (num: number) => `${num} memories.`,
    password: "Password",
    memories: "Memories",
    profilePicture: "Profile Picture",
    settings: "Settings",
    timelineView: "Timeline View",
    untitledAlbum: "Untitled Album",
    verifyEmailTitle: "Verify Email",
    viewers: "Viewers",
    viewersTooltip:
      "Users who will be allowed to view this album. (Enter email)",
    copyright: `© Nicholas Estrada ${new Date().getFullYear()}`,
    jobs: (jobCount: number) =>
      `${jobCount} job${
        jobCount > 1 ? "s" : ""
      } running. Do not close this window.`,
  },
  prompt: {
    alreadyHaveAccount: "Already have an account?",
    forgotPassword: "Forgot Password?",
    installPrompt: "Use Shadowboxx offline!",
    noAccount: "Don't have an account?",
    pleaseEnterA: (field: string) => `Please enter a ${field}`,
    tryAddingAlbum: "Try adding one below",
    undoEmailChange: "Changed your email address and want to go back?",
    didntReceiveCode: "Didn't receive code?",
    isDuplicate: "Are these images the same?",
  },
  cloud: {
    error: {
      userNotWhitelisted: "User not whitelisted and public logins are disabled",
      emailNotVerified: "Email not verified",
      imageNotFound: "Image not found",
      failedToSendVerificationEmail: "Failed to send verification email",
      userNotFound: "User not found",
      pleaseWaitSeconds: (seconds: number) =>
        `Please wait ${seconds} seconds before trying again`,
      noPreviousEmailFound: "No previous email found",
      invalidVerificationCode: "Invalid verification code",
    },
  },
} as const;

export default Strings;
