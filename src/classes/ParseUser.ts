import Parse, { FullOptions } from "parse";
import { Strings } from "../resources";
import ParseObject, { Attributes, Columns, ParsifyPointers } from "./ParseObject";
import ParsePointer from "./ParsePointer";

/** Interface defining User-specific attributes */
export interface UserAttributes {
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
  profilePicture?: ParsePointer<"Image">;
  /** List of favorited album ids */
  favoriteAlbums: string[];
}

export type UpdateLoggedInUser = (
  loggedInUser: ParseUser,
  reason: UserUpdateReason
) => Promise<void>;

export enum UserUpdateReason {
  LOG_IN,
  SIGN_UP,
  UPDATE,
  LOG_OUT,
}

class UserColumns extends Columns {
  emailVerified = "emailVerified" as const;
  password = "password" as const;
  email = "email" as const;
  lastName = "lastName" as const;
  firstName: "firstName" = "firstName";
  isDarkThemeEnabled = "isDarkThemeEnabled" as const;
  profilePicture = "profilePicture" as const;
  username = "username" as const;
  favoriteAlbums = "favoriteAlbums" as const;
}

/**
 * Class wrapping the Parse.User class and providing convenience methods/properties
 */
export default class ParseUser extends ParseObject<"_User"> {
  /**
   * Columns for the Parse.User ("User") class
   */
  static COLUMNS = new UserColumns();

  /**
   * Gets a Parse.Query for the Parse.User ("User") class
   * @param online Whether to query online or not
   * @returns A Parse.Query for the Parse.User ("User") class
   */
  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.User<ParsifyPointers<"_User">>>("User");
    }
    return new Parse.Query<Parse.User<ParsifyPointers<"_User">>>("User").fromLocalDatastore();
  }

  _user: Parse.User<ParsifyPointers<"_User">>;

  constructor(user: Parse.User<ParsifyPointers<"_User">>) {
    super(user);
    this._user = user;
    this.pin();
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
    await updateLoggedInUser(new ParseUser(loggedInUser), UserUpdateReason.LOG_IN);
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
      UserUpdateReason.SIGN_UP
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
        UserUpdateReason.UPDATE
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
        Parse.User<ParsifyPointers<"_User">>
      >();
      await updateLoggedInUser(
        new ParseUser(loggedOutUser),
        UserUpdateReason.LOG_OUT
      );
      return new ParseUser(loggedOutUser);
    } catch (error: any) {
      console.error(error?.message ?? Strings.commonError());
      await updateLoggedInUser(this, UserUpdateReason.LOG_OUT);
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
  get profilePicture(): ParsePointer<"Image"> | undefined {
    const profilePicture = this._user.get(ParseUser.COLUMNS.profilePicture);
    return profilePicture ? new ParsePointer(profilePicture) : undefined;
  }

  set profilePicture(profilePicture) {
    this._user.set(ParseUser.COLUMNS.profilePicture, profilePicture?.toNativePointer());
  }

  /** This user's list of favorited albums */
  get favoriteAlbums(): string[] {
    return this._user.get(ParseUser.COLUMNS.favoriteAlbums);
  }

  set favoriteAlbums(favoriteAlbums) {
    this._user.set(ParseUser.COLUMNS.favoriteAlbums, favoriteAlbums);
  }

  /** Alias to _user.attributes but with the pointers as ParsePointer objects */
  get attributes(): Attributes<"_User"> {
    return {
      ...this._user.attributes,
      profilePicture: this.profilePicture,
    };
  }
}

/**
 * Class wrapping the ParseUser class for when an unpersisted user is needed
 */
export class UnpersistedParseUser extends ParseUser {
  constructor(attributes: Partial<Attributes<"_User">> = {}) {
    super(new Parse.User<ParsifyPointers<"_User">>({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      favoriteAlbums: [],
      isDarkThemeEnabled: false,
      objectId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...attributes,
      profilePicture: attributes.profilePicture?.toNativePointer(),
    }));
  }

  get id(): Attributes<"_User">["objectId"] {
    throw new Error("Cannot get id on unpersisted ParseUser");
  }

  get createdAt(): Attributes<"_User">["createdAt"] {
    throw new Error("Cannot get createdAt on unpersisted ParseUser");
  }

  get updatedAt(): Attributes<"_User">["updatedAt"] {
    throw new Error("Cannot get updatedAt on unpersisted ParseUser");
  }
}
