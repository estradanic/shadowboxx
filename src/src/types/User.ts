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

export class ParseUser {
  static fromAttributes = (attributes: Partial<User>): ParseUser => {
    const fullAttributes: User = {
      username: attributes.username ?? attributes.email ?? "",
      password: attributes.password ?? "",
      email: attributes.email ?? attributes.username ?? "",
      isDarkThemeEnabled: attributes.isDarkThemeEnabled ?? false,
      firstName:
        attributes.firstName ?? attributes.email ?? attributes.username ?? "",
      lastName: attributes.lastName ?? "",
    };
    return new ParseUser(new Parse.User(fullAttributes));
  };

  _user: Parse.User<User>;

  constructor(user: Parse.User<User>) {
    this._user = user;
  }

  async fetch() {
    return new ParseUser(await this._user.fetch());
  }

  toPointer() {
    return this._user.toPointer();
  }

  async login(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    return await this._user.logIn(options).then((loggedInUser) => {
      updateLoggedInUser(new ParseUser(loggedInUser), UpdateReason.LOG_IN);
      return loggedInUser;
    });
  }

  async signup(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    return await this._user.signUp(undefined, options).then((loggedInUser) => {
      updateLoggedInUser(new ParseUser(loggedInUser), UpdateReason.SIGN_UP);
      return loggedInUser;
    });
  }

  async update(
    updateLoggedInUser: UpdateLoggedInUser,
    options?: Parse.Object.SaveOptions
  ) {
    return await this._user.save(undefined, options).then((loggedInUser) => {
      updateLoggedInUser(new ParseUser(loggedInUser), UpdateReason.UPDATE);
      return loggedInUser;
    });
  }

  async logout(updateLoggedInUser: UpdateLoggedInUser) {
    return await Parse.User.logOut<Parse.User<User>>().then((loggedOutUser) => {
      updateLoggedInUser(new ParseUser(loggedOutUser), UpdateReason.LOG_OUT);
      return loggedOutUser;
    });
  }

  get objectId(): string | undefined {
    return this._user.get("objectId") ?? this._user.id;
  }

  get emailVerified(): boolean | undefined {
    return this._user.get("emailVerified");
  }

  set emailVerified(emailVerified) {
    this._user.set("emailVerified", emailVerified);
  }

  get username(): string {
    return this._user.get("username");
  }

  set username(username) {
    this._user.setUsername(username);
  }

  set password(password: string) {
    this._user.setPassword(password);
  }

  get email(): string {
    return this._user.get("email");
  }

  set email(email) {
    this._user.setEmail(email);
  }

  get lastName(): string {
    return this._user.get("lastName");
  }

  set lastName(lastName) {
    this._user.set("lastName", lastName);
  }

  get firstName(): string {
    return this._user.get("firstName");
  }

  set firstName(firstName) {
    this._user.set("firstName", firstName);
  }

  get isDarkThemeEnabled(): boolean {
    return this._user.get("isDarkThemeEnabled");
  }

  set isDarkThemeEnabled(isDarkThemeEnabled) {
    this._user.set("isDarkThemeEnabled", isDarkThemeEnabled);
  }

  get profilePicture(): Parse.Pointer | undefined {
    return this._user.get("profilePicture");
  }

  set profilePicture(profilePicture) {
    this._user.set("profilePicture", profilePicture);
  }
}
