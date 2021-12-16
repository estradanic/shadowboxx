import Parse, { FullOptions } from "parse";
import { Attributes } from "./ParseObject";

export interface User extends Attributes {
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

export type UpdateLoggedInUser = (
  loggedInUser: ParseUser,
  reason: UpdateReason
) => void;

export enum UpdateReason {
  LOG_IN,
  SIGN_UP,
  UPDATE,
  LOG_OUT,
}

export class ParseUser extends Parse.User<User> {
  constructor(
    username: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) {
    super({
      username,
      email: username,
      password,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      isDarkThemeEnabled: false,
    });
  }

  async login(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    return super.logIn(options).then((loggedInUser) => {
      updateLoggedInUser(loggedInUser, UpdateReason.LOG_IN);
      return loggedInUser;
    });
  }

  async signup(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    return super.signUp(undefined, options).then((loggedInUser) => {
      updateLoggedInUser(loggedInUser, UpdateReason.SIGN_UP);
      return loggedInUser;
    });
  }

  async update(
    updateLoggedInUser: UpdateLoggedInUser,
    options?: Parse.Object.SaveOptions
  ) {
    return super.save(undefined, options).then((loggedInUser) => {
      updateLoggedInUser(loggedInUser, UpdateReason.UPDATE);
      return loggedInUser;
    });
  }

  async logout(updateLoggedInUser: UpdateLoggedInUser) {
    return ParseUser.logOut().then((loggedOutUser) => {
      updateLoggedInUser(loggedOutUser as ParseUser, UpdateReason.LOG_OUT);
      return loggedOutUser;
    });
  }

  get objectId(): string | undefined {
    return this.get("objectId");
  }

  get emailVerified(): boolean | undefined {
    return this.get("emailVerified");
  }

  set emailVerified(emailVerified) {
    this.set("emailVerified", emailVerified);
  }

  get username(): string {
    return this.get("username");
  }

  set username(username) {
    this.setUsername(username);
  }

  set password(password: string) {
    this.setPassword(password);
  }

  get email(): string {
    return this.get("email");
  }

  set email(email) {
    this.setEmail(email);
  }

  get lastName(): string {
    return this.get("lastName");
  }

  set lastName(lastName) {
    this.set("lastName", lastName);
  }

  get firstName(): string {
    return this.get("firstName");
  }

  set firstName(firstName) {
    this.set("firstName", firstName);
  }

  get isDarkThemeEnabled(): boolean {
    return this.get("isDarkThemeEnabled");
  }

  set isDarkThemeEnabled(isDarkThemeEnabled) {
    this.set("isDarkThemeEnabled", isDarkThemeEnabled);
  }

  get profilePicture(): Parse.Pointer | undefined {
    return this.get("profilePicture");
  }

  set profilePicture(profilePicture) {
    this.set("profilePicture", profilePicture);
  }
}
