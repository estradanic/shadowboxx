import Parse, { FullOptions } from "parse";
import ParseObject, {
  Attributes,
  Columns,
  ParsifyPointers,
} from "./ParseObject";
import ParsePointer from "./ParsePointer";
import ParseQuery from "./ParseQuery";

/** Interface defining User-specific attributes */
export interface UserAttributes {
  /** Username (email) for login */
  username: string;
  /** Password for login */
  password: string;
  /** Email address */
  email: string;
  /** Old email address in case of email change */
  oldEmail?: string;
  /** Last name */
  lastName: string;
  /** First name */
  firstName: string;
  /** Whether dark theme is enabled */
  isDarkThemeEnabled: boolean;
  /** Pointer to Image record for profile picture */
  profilePicture?: ParsePointer<"Image">;
  /** List of favorited album ids */
  favoriteAlbums: string[];
  /** Whether detailed logging is turned on for this user */
  isLoggingEnabled: boolean;
  /** Ephemeral verification code for email changes */
  verificationCode?: string;
}

type UserKeys = Required<{
  [key in keyof UserAttributes]: key;
}>;

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

class UserColumns extends Columns implements UserKeys {
  password = "password" as const;
  email = "email" as const;
  lastName = "lastName" as const;
  firstName: "firstName" = "firstName";
  isDarkThemeEnabled = "isDarkThemeEnabled" as const;
  profilePicture = "profilePicture" as const;
  username = "username" as const;
  favoriteAlbums = "favoriteAlbums" as const;
  oldEmail = "oldEmail" as const;
  isLoggingEnabled = "isLoggingEnabled" as const;
  verificationCode = "verificationCode" as const;
}

/**
 * Class wrapping the Parse.User class and providing convenience methods/properties
 */
export default class ParseUser
  extends ParseObject<"_User">
  implements UserAttributes
{
  /**
   * Columns for the Parse.User ("_User") class
   */
  static COLUMNS = new UserColumns();

  /**
   * Gets a Parse.Query for the Parse.User ("_User") class. For client code only.
   * @param online Whether to query online
   * @returns A Parse.Query for the Parse.User ("_User") class
   */
  static query(online = true) {
    let nativeQuery;
    if (online) {
      nativeQuery = new Parse.Query<Parse.User<ParsifyPointers<"_User">>>(
        Parse.User
      );
    } else {
      nativeQuery = new Parse.Query<Parse.User<ParsifyPointers<"_User">>>(
        Parse.User
      ).fromLocalDatastore();
    }
    return new ParseQuery(nativeQuery);
  }

  /**
   * Gets a Parse.Query for the Parse.User ("_User") class. For cloud code only.
   * @param parse instance of Parse
   * @returns A Parse.Query for the Parse.User ("_User") class
   */
  static cloudQuery(parse: typeof Parse) {
    return ParseQuery.for("_User", parse);
  }

  private _user: Parse.User<ParsifyPointers<"_User">>;

  constructor(
    user: Parse.User<ParsifyPointers<"_User">>,
    noPin: boolean = false
  ) {
    super(user);
    this._user = user;
    if (!noPin) {
      this.pin();
    }
  }

  /** Gets acl from this user */
  acl(): Parse.ACL {
    if (this instanceof UnpersistedParseUser) {
      return new Parse.ACL();
    }
    return new Parse.ACL(this._user);
  }

  /**
   * Checks to see if that ParseUser is equal to this one
   * @param that The other ParseUser to compare to
   * @returns Whether the two ParseUsers are equal
   */
  equals(that: ParseUser | ParseObject<"_User">): boolean {
    if (!(that instanceof ParseUser)) {
      return false;
    }
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
    return this.objectId ?? `${this.firstName}${this.lastName}${this.email}`;
  }

  /**
   * Fetches the ParseUser from the server
   * @returns The fetched ParseUser
   */
  async fetch(options?: Parse.Object.FetchOptions) {
    return new ParseUser(await this._user.fetch(options));
  }

  /**
   * Fetches the ParseUser from the db
   * @returns The fetched ParseUser
   */
  async cloudFetch(options?: Parse.Object.FetchOptions) {
    return new ParseUser(await this._user.fetch(options), true);
  }

  /**
   * Logs in the ParseUser
   * @param updateLoggedInUser Callback function to update the logged in user
   * @param options Options to pass to the Parse login function
   * @returns The logged in ParseUser
   */
  async login(updateLoggedInUser: UpdateLoggedInUser, options?: FullOptions) {
    const loggedInUser = await this._user.logIn(options);
    await updateLoggedInUser(
      new ParseUser(loggedInUser),
      UserUpdateReason.LOG_IN
    );
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
      console.error(error);
    }
  }

  /**
   * Save the ParseUser
   * @param options
   * @returns The saved ParseUser
   */
  async save(options?: Parse.Object.SaveOptions) {
    return new ParseUser(await this._user.save(undefined, options));
  }

  /**
   * Save the ParseUser - Only for cloud code
   */
  async cloudSave(options?: Parse.Object.SaveOptions) {
    return new ParseUser(await this._user.save(undefined, options), true);
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
        new ParseUser(loggedOutUser, true),
        UserUpdateReason.LOG_OUT
      );
      return new ParseUser(loggedOutUser, true);
    } catch (error: any) {
      console.error(error);
      await updateLoggedInUser(this, UserUpdateReason.LOG_OUT);
    }
  }

  get username(): UserAttributes["username"] {
    return this._user.get(ParseUser.COLUMNS.username);
  }

  set username(username) {
    this._user.setUsername(username);
  }

  set password(password: string) {
    this._user.setPassword(password);
  }

  get email(): UserAttributes["email"] {
    return (
      this._user.get(ParseUser.COLUMNS.email) ??
      this._user.getEmail() ??
      this._user.getUsername()
    );
  }

  set email(email) {
    this._user.setEmail(email);
  }

  get lastName(): UserAttributes["lastName"] {
    return this._user.get(ParseUser.COLUMNS.lastName);
  }

  set lastName(lastName) {
    this._user.set(ParseUser.COLUMNS.lastName, lastName);
  }

  get firstName(): UserAttributes["firstName"] {
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

  get isDarkThemeEnabled(): UserAttributes["isDarkThemeEnabled"] {
    return this._user.get(ParseUser.COLUMNS.isDarkThemeEnabled);
  }

  set isDarkThemeEnabled(isDarkThemeEnabled) {
    this._user.set(ParseUser.COLUMNS.isDarkThemeEnabled, isDarkThemeEnabled);
  }

  get profilePicture(): UserAttributes["profilePicture"] {
    const profilePicture = this._user.get(ParseUser.COLUMNS.profilePicture);
    return profilePicture
      ? new ParsePointer<"Image">(profilePicture)
      : undefined;
  }

  set profilePicture(profilePicture) {
    this._user.set(
      ParseUser.COLUMNS.profilePicture,
      profilePicture?.toNativePointer()
    );
  }

  get favoriteAlbums(): UserAttributes["favoriteAlbums"] {
    return this._user.get(ParseUser.COLUMNS.favoriteAlbums);
  }

  set favoriteAlbums(favoriteAlbums) {
    this._user.set(ParseUser.COLUMNS.favoriteAlbums, favoriteAlbums);
  }

  get oldEmail(): UserAttributes["oldEmail"] {
    return this._user.get(ParseUser.COLUMNS.oldEmail);
  }

  set oldEmail(oldEmail) {
    this._user.set(ParseUser.COLUMNS.oldEmail, oldEmail);
  }

  get isLoggingEnabled(): UserAttributes["isLoggingEnabled"] {
    return this._user.get(ParseUser.COLUMNS.isLoggingEnabled);
  }

  get verificationCode(): UserAttributes["verificationCode"] {
    return this._user.get(ParseUser.COLUMNS.verificationCode);
  }

  set verificationCode(verificationCode) {
    this._user.set(ParseUser.COLUMNS.verificationCode, verificationCode);
  }

  /** Alias to _user.attributes but with the pointers as ParsePointer objects */
  get attributes(): Attributes<"_User"> {
    return {
      ...this._user.attributes,
      profilePicture: this.profilePicture,
    };
  }

  toNative() {
    return this._user;
  }
}

/**
 * Class wrapping the ParseUser class for when an unpersisted user is needed
 */
export class UnpersistedParseUser extends ParseUser {
  constructor(attributes: Partial<Attributes<"_User">> = {}) {
    super(
      // @ts-expect-error
      new Parse.User<ParsifyPointers<"_User">>({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        favoriteAlbums: [],
        isDarkThemeEnabled: false,
        ...attributes,
        profilePicture: attributes.profilePicture?.toNativePointer(),
      })
    );
  }

  get objectId(): Attributes<"_User">["objectId"] {
    console.warn("Unpersisted user has no id");
    return "";
  }

  get createdAt(): Attributes<"_User">["createdAt"] {
    console.warn("Unpersisted user has no createdAt");
    return new Date();
  }

  get updatedAt(): Attributes<"_User">["updatedAt"] {
    console.warn("Unpersisted user has no updatedAt");
    return new Date();
  }

  isNew() {
    return true;
  }
}
