import Parse, { FullOptions } from "parse";
import { Strings } from "../resources";
import { Attributes, ParsifyPointers, isPointer } from "./ParseObject";
import ParsePointer from "./ParsePointer";

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
  profilePicture?: ParsePointer;
  /** List of favorited album ids */
  favoriteAlbums: string[];
}

export type UpdateLoggedInUser = (
  loggedInUser: ParseUser,
  reason: UpdateReason
) => Promise<void>;

export enum UpdateReason {
  LOG_IN,
  SIGN_UP,
  UPDATE,
  LOG_OUT,
}

/**
 * Class wrapping the Parse.User class and providing convenience methods/properties
 */
export default class ParseUser {
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
    favoriteAlbums: "favoriteAlbums",
  };

  static NULL = new ParseUser(
    new Parse.User<ParsifyPointers<User>>({
      username: "",
      password: "",
      email: "",
      lastName: "",
      firstName: "",
      isDarkThemeEnabled: false,
      favoriteAlbums: [],
    })
  );

  static query() {
    return new Parse.Query<Parse.User<ParsifyPointers<User>>>("User");
  }

  static fromAttributes = (attributes: Partial<User>): ParseUser => {
    const fullAttributes: ParsifyPointers<User> = {
      username: attributes.username ?? attributes.email ?? "",
      password: attributes.password ?? "",
      email: attributes.email ?? attributes.username ?? "",
      isDarkThemeEnabled: attributes.isDarkThemeEnabled ?? false,
      firstName:
        attributes.firstName ?? attributes.email ?? attributes.username ?? "",
      lastName: attributes.lastName ?? "",
      profilePicture: attributes.profilePicture?._pointer,
      favoriteAlbums: attributes.favoriteAlbums ?? [],
    };
    const newParseUser = new ParseUser(
      new Parse.User<ParsifyPointers<User>>(fullAttributes)
    );

    // Set this again to make sure that the pointer is the right type
    newParseUser.profilePicture = attributes.profilePicture;
    return newParseUser;
  };

  _user: Parse.User<ParsifyPointers<User>>;

  constructor(user: Parse.User<ParsifyPointers<User>>) {
    this._user = user;
  }

  equals(that: ParseUser): boolean {
    return (
      this.email === that.email &&
      this.isDarkThemeEnabled === that.isDarkThemeEnabled &&
      this.firstName === that.firstName &&
      this.lastName === that.lastName &&
      this.profilePicture?.id === that.profilePicture?.id
    );
  }

  hashString(): string {
    return this.id ?? `${this.firstName}${this.lastName}${this.email}`;
  }

  async fetch() {
    return new ParseUser(await this._user.fetch());
  }

  toPointer(): ParsePointer {
    if (this._user.isNew()) {
      return ParsePointer.NULL;
    }
    return new ParsePointer(this._user.toPointer());
  }

  toNativePointer(): Parse.Pointer {
    return this._user.toPointer();
  }

  async login(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    const loggedInUser = await this._user.logIn(options);
    await updateLoggedInUser(new ParseUser(loggedInUser), UpdateReason.LOG_IN);
    return new ParseUser(loggedInUser);
  }

  async signup(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    try {
      const loggedInUser = await this._user.signUp(undefined, options);
      await updateLoggedInUser(
        new ParseUser(loggedInUser),
        UpdateReason.SIGN_UP
      );
      return new ParseUser(loggedInUser);
    } catch (error: any) {
      console.error(error?.message ?? Strings.commonError());
    }
  }

  async update(
    updateLoggedInUser: UpdateLoggedInUser,
    options?: Parse.Object.SaveOptions
  ) {
    try {
      const loggedInUser = await this._user.save(undefined, options);
      await updateLoggedInUser(
        new ParseUser(loggedInUser),
        UpdateReason.UPDATE
      );
      return new ParseUser(loggedInUser);
    } catch (error: any) {
      console.error(error?.message ?? Strings.commonError());
    }
  }

  async logout(updateLoggedInUser: UpdateLoggedInUser) {
    try {
      const loggedOutUser = await Parse.User.logOut<
        Parse.User<ParsifyPointers<User>>
      >();
      await updateLoggedInUser(
        new ParseUser(loggedOutUser),
        UpdateReason.LOG_OUT
      );
      return new ParseUser(loggedOutUser);
    } catch (error: any) {
      console.error(error?.message ?? Strings.commonError());
      await updateLoggedInUser(this, UpdateReason.LOG_OUT);
    }
  }

  get exists(): boolean {
    return !!this._user;
  }

  get attributes(): User {
    const attributes: any = {};
    for (const key in this._user.attributes) {
      if (isPointer(this._user.attributes[key])) {
        attributes[key] = new ParsePointer(this._user.attributes[key]);
      } else {
        attributes[key] = this._user.attributes[key];
      }
    }
    return attributes;
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
    return (
      this._user.get(ParseUser.COLUMNS.email) ??
      this._user.getEmail() ??
      this._user.getUsername()
    );
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

  get name(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.email;
  }

  get isDarkThemeEnabled(): boolean {
    return this._user.get(ParseUser.COLUMNS.isDarkThemeEnabled);
  }

  set isDarkThemeEnabled(isDarkThemeEnabled) {
    this._user.set(ParseUser.COLUMNS.isDarkThemeEnabled, isDarkThemeEnabled);
  }

  get profilePicture(): ParsePointer | undefined {
    return new ParsePointer(this._user.get(ParseUser.COLUMNS.profilePicture));
  }

  set profilePicture(profilePicture) {
    this._user.set(ParseUser.COLUMNS.profilePicture, profilePicture?._pointer);
  }

  get favoriteAlbums(): string[] {
    return this._user.get(ParseUser.COLUMNS.favoriteAlbums);
  }

  set favoriteAlbums(favoriteAlbums) {
    this._user.set(ParseUser.COLUMNS.favoriteAlbums, favoriteAlbums);
  }
}
