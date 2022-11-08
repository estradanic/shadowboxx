import Parse, { FullOptions } from "parse";
import { Strings } from "../resources";
import ParseObject, { Attributes, ParsifyPointers } from "./ParseObject";
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
export default class ParseUser extends ParseObject<User> {
  /**
   * Columns for the Parse.User ("User") class
   */
  static COLUMNS = {
    ...ParseObject.COLUMNS,
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

  /**
   * Gets a Parse.Query for the Parse.User ("User") class
   * @param online Whether to query online or not
   * @returns A Parse.Query for the Parse.User ("User") class
   */
  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.User<ParsifyPointers<User>>>("User");
    }
    return new Parse.Query<Parse.User<ParsifyPointers<User>>>("User").fromLocalDatastore();
  }

  /**
   * Creates a new ParseUser from attributes
   * @param attributes Attributes to create the ParseUser from
   * @returns A new ParseUser
   */
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
    super(user);
    this._user = user;
  }

  /**
   * Checks to see if that ParseUser is equal to this one
   * @param that The other ParseUser to compare to
   * @returns Whether the two ParseUsers are equal or not
   */
  equals(that: ParseUser): boolean {
    return (
      this.email === that.email &&
      this.isDarkThemeEnabled === that.isDarkThemeEnabled &&
      this.firstName === that.firstName &&
      this.lastName === that.lastName &&
      this.profilePicture?.id === that.profilePicture?.id
    );
  }

  /**
   * Get the hashstring for this ParseUser
   * @returns Hashstring of the ParseUser
   */
  hashString(): string {
    return this.id ?? `${this.firstName}${this.lastName}${this.email}`;
  }

  /**
   * Fetches the ParseUser from the server
   * @returns The fetched ParseUser
   */
  async fetch() {
    return new ParseUser(await this._user.fetch());
  }

  /**
   * Logs in the ParseUser
   * @param updateLoggedInUser Callback function to update the logged in user
   * @param options Options to pass to the Parse login function
   * @returns The logged in ParseUser
   */
  async login(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    const loggedInUser = await this._user.logIn(options);
    await updateLoggedInUser(new ParseUser(loggedInUser), UpdateReason.LOG_IN);
    return new ParseUser(loggedInUser);
  }

  /**
   * Signs up the ParseUser
   * @param updateLoggedInUser Callback function to update the logged in user
   * @param options Options to pass to the Parse signUp function
   * @returns The signed up ParseUser
   */
  async signup(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    const loggedInUser = await this._user.signUp(undefined, options);
    await updateLoggedInUser(
      new ParseUser(loggedInUser),
      UpdateReason.SIGN_UP
    );
    return new ParseUser(loggedInUser);
  }

  /**
   * Updates and saves the ParseUser
   * @param updateLoggedInUser Callback function to update the logged in user
   * @param options Options to pass to the Parse save function
   * @returns The saved ParseUser
   */
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

  /**
   * Log out the ParseUser
   * @param updateLoggedInUser Callback function to update the logged in user
   * @returns The logged out ParseUser
   */
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

  /** Whether this user's email has been verified */
  get emailVerified(): boolean | undefined {
    return this._user.get(ParseUser.COLUMNS.emailVerified);
  }

  set emailVerified(emailVerified) {
    this._user.set(ParseUser.COLUMNS.emailVerified, emailVerified);
  }

  /** This user's username */
  get username(): string {
    return this._user.get(ParseUser.COLUMNS.username);
  }

  set username(username) {
    this._user.setUsername(username);
  }

  set password(password: string) {
    this._user.setPassword(password);
  }

  /** This user's email */
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

  /** This user's last name */
  get lastName(): string {
    return this._user.get(ParseUser.COLUMNS.lastName);
  }

  set lastName(lastName) {
    this._user.set(ParseUser.COLUMNS.lastName, lastName);
  }

  /** This user's first name */
  get firstName(): string {
    return this._user.get(ParseUser.COLUMNS.firstName);
  }

  set firstName(firstName) {
    this._user.set(ParseUser.COLUMNS.firstName, firstName);
  }

  /** This user's full name */
  get name(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.email;
  }

  /** Whether the user has dark theme enabled */
  get isDarkThemeEnabled(): boolean {
    return this._user.get(ParseUser.COLUMNS.isDarkThemeEnabled);
  }

  set isDarkThemeEnabled(isDarkThemeEnabled) {
    this._user.set(ParseUser.COLUMNS.isDarkThemeEnabled, isDarkThemeEnabled);
  }

  /** This user's profile picture, if it exists */
  get profilePicture(): ParsePointer | undefined {
    return new ParsePointer(this._user.get(ParseUser.COLUMNS.profilePicture));
  }

  set profilePicture(profilePicture) {
    this._user.set(ParseUser.COLUMNS.profilePicture, profilePicture?._pointer);
  }

  /** This user's list of favorited albums */
  get favoriteAlbums(): string[] {
    return this._user.get(ParseUser.COLUMNS.favoriteAlbums);
  }

  set favoriteAlbums(favoriteAlbums) {
    this._user.set(ParseUser.COLUMNS.favoriteAlbums, favoriteAlbums);
  }

  /** Alias to _user.attributes but with the pointers as ParsePointer objects */
  get attributes(): User {
    return {
      ...this._user.attributes,
      profilePicture: this.profilePicture,
    };
  }
}
