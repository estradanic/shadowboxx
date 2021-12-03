import Parse from "parse";

export default interface User {
  /** Unique id of the object in the database */
  objectId?: string;
  /** Date created */
  createdAt?: Date;
  /** Date last updated */
  updatedAt?: Date;
  /** Whether email has been verified or not */
  emailVerified?: boolean;
  /** Username (email) for login */
  username: string;
  /** Password for login */
  password: string;
  /** Email address */
  email: string;
  /** Last name */
  lastName: string;
  /** First name */
  firstName: string;
  /** Whether dark theme is enabled or not */
  isDarkThemeEnabled: boolean;
  /** Pointer to Image record for profile picture */
  profilePicture?: Parse.Pointer;
}
