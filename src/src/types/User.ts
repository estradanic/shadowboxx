import Parse, { FullOptions } from "parse";
import { Attributes } from "./ParseObject";
import Pointer from "./Pointer";

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

/**
 * Class wrapping the Parse.User class and providing convenience methods/properties
 */
export class ParseUser {
  static COLUMNS: { [key: string]: string } = {
    id: "objectId",
    emailVerified: "emailVerified",
    password: "password",
    email: "email",
    lastName: "lastName",
    firstName: "firstName",
    isDarkThemeEnabled: "isDarkThemeEnabled",
    profilePicture: "profilePicture",
    username: "username",
  };

  static fromAttributes = (attributes: Partial<User>): ParseUser => {
    const fullAttributes: User = {
      username: attributes.username ?? attributes.email ?? "",
      password: attributes.password ?? "",
      email: attributes.email ?? attributes.username ?? "",
      isDarkThemeEnabled: attributes.isDarkThemeEnabled ?? false,
      firstName:
        attributes.firstName ?? attributes.email ?? attributes.username ?? "",
      lastName: attributes.lastName ?? "",
      profilePicture: attributes.profilePicture,
    };
    return new ParseUser(new Parse.User(fullAttributes));
  };

  _user: Parse.User<User>;

  constructor(user: Parse.User<User>) {
    this._user = user;
  }

  isEqual(pi: ParseUser): boolean {
    return (
      this.email === pi.email &&
      this.isDarkThemeEnabled === pi.isDarkThemeEnabled &&
      this.firstName === pi.firstName &&
      this.lastName === pi.lastName &&
      this.profilePicture?.id === pi.profilePicture?.id
    );
  }

  async fetch() {
    return new ParseUser(await this._user.fetch());
  }

  toPointer(): Parse.Pointer {
    return this._user.toPointer();
  }

  async login(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    return await this._user.logIn(options).then((loggedInUser) => {
      updateLoggedInUser(new ParseUser(loggedInUser), UpdateReason.LOG_IN);
      return new ParseUser(loggedInUser);
    });
  }

  async signup(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    return await this._user.signUp(undefined, options).then((loggedInUser) => {
      updateLoggedInUser(new ParseUser(loggedInUser), UpdateReason.SIGN_UP);
      return new ParseUser(loggedInUser);
    });
  }

  async update(
    updateLoggedInUser: UpdateLoggedInUser,
    options?: Parse.Object.SaveOptions
  ) {
    return await this._user.save(undefined, options).then((loggedInUser) => {
      updateLoggedInUser(new ParseUser(loggedInUser), UpdateReason.UPDATE);
      return new ParseUser(loggedInUser);
    });
  }

  async logout(updateLoggedInUser: UpdateLoggedInUser) {
    return await Parse.User.logOut<Parse.User<User>>().then((loggedOutUser) => {
      updateLoggedInUser(new ParseUser(loggedOutUser), UpdateReason.LOG_OUT);
      return new ParseUser(loggedOutUser);
    });
  }

  get attributes(): User {
    return this._user.attributes;
  }

  get id(): string | undefined {
    return this._user.get(ParseUser.COLUMNS.id) ?? this._user.id;
  }

  get emailVerified(): boolean | undefined {
    return this._user.get(ParseUser.COLUMNS.emailVerified);
  }

  set emailVerified(emailVerified) {
    this._user.set(ParseUser.COLUMNS.emailVerified, emailVerified);
  }

  get username(): string {
    return this._user.get(ParseUser.COLUMNS.username);
  }

  set username(username) {
    this._user.setUsername(username);
  }

  set password(password: string) {
    this._user.setPassword(password);
  }

  get email(): string {
    return this._user.get(ParseUser.COLUMNS.email);
  }

  set email(email) {
    this._user.setEmail(email);
  }

  get lastName(): string {
    return this._user.get(ParseUser.COLUMNS.lastName);
  }

  set lastName(lastName) {
    this._user.set(ParseUser.COLUMNS.lastName, lastName);
  }

  get firstName(): string {
    return this._user.get(ParseUser.COLUMNS.firstName);
  }

  set firstName(firstName) {
    this._user.set(ParseUser.COLUMNS.firstName, firstName);
  }

  get isDarkThemeEnabled(): boolean {
    return this._user.get(ParseUser.COLUMNS.isDarkThemeEnabled);
  }

  set isDarkThemeEnabled(isDarkThemeEnabled) {
    this._user.set(ParseUser.COLUMNS.isDarkThemeEnabled, isDarkThemeEnabled);
  }

  get profilePicture(): Pointer | undefined {
    return new Pointer(this._user.get(ParseUser.COLUMNS.profilePicture));
  }

  set profilePicture(profilePicture) {
    this._user.set(ParseUser.COLUMNS.profilePicture, profilePicture?._pointer);
  }
}
