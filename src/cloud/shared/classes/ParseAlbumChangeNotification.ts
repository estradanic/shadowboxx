import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, {
  Attributes,
  Columns,
  ParsifyPointers,
} from "./ParseObject";
import ParseQuery from "./ParseQuery";

/** Interface defining AlbumChangeNotification-specific attributes */
export interface AlbumChangeNotificationAttributes {
  /** Album that was changed */
  album: ParsePointer<"Album">;
  /** User that changed the album */
  user: ParsePointer<"_User">;
  /** The number of unacknowledged changes */
  count: number;
  /** User that is being notified ("owns" this notification) */
  owner: ParsePointer<"_User">;
}

type AlbumChangedNotificationKeys = Required<{
  [key in keyof AlbumChangeNotificationAttributes]: key;
}>;

class AlbumChangeNotificationColumns
  extends Columns
  implements AlbumChangedNotificationKeys
{
  album = "album" as const;
  user = "user" as const;
  count = "count" as const;
  owner = "owner" as const;
}

/**
 * Class wrapping the Parse.AlbumChangeNotification class and providing convenience methods/properties
 */
export default class ParseAlbumChangeNotification
  extends ParseObject<"AlbumChangeNotification">
  implements AlbumChangeNotificationAttributes
{
  /** Columns for the AlbumChangeNotification class */
  static COLUMNS = new AlbumChangeNotificationColumns();

  /**
   * Get a ParseQuery for the "AlbumChangeNotification" class. For client code only.
   * @param online Whether to query online, defaults to true
   * @returns ParseQuery for the "AlbumChangeNotification" class
   */
  static query(online = true) {
    let nativeQuery;
    if (online) {
      nativeQuery = new Parse.Query<
        Parse.Object<ParsifyPointers<"AlbumChangeNotification">>
      >("AlbumChangeNotification");
    } else {
      nativeQuery = new Parse.Query<
        Parse.Object<ParsifyPointers<"AlbumChangeNotification">>
      >("AlbumChangeNotification").fromLocalDatastore();
    }
    return new ParseQuery(nativeQuery, false);
  }

  /**
   * Get a ParseQuery for the "AlbumChangeNotification" class. For cloud code only.
   * @param parse Parse instance
   * @returns ParseQuery for the "AlbumChangeNotification" class
   */
  static cloudQuery(parse: typeof Parse) {
    return ParseQuery.for("AlbumChangeNotification", parse);
  }

  private _albumChangeNotification: Parse.Object<
    ParsifyPointers<"AlbumChangeNotification">
  >;

  constructor(
    albumChangeNotification: Parse.Object<
      ParsifyPointers<"AlbumChangeNotification">
    >
  ) {
    super(albumChangeNotification);
    this._albumChangeNotification = albumChangeNotification;
  }

  /** Acknowledge the change notification */
  async acknowledge() {
    this.count = 0;
    await this._albumChangeNotification.save();
  }

  get album(): Attributes<"AlbumChangeNotification">["album"] {
    return new ParsePointer(
      this._albumChangeNotification.get(
        ParseAlbumChangeNotification.COLUMNS.album
      )
    );
  }

  get user(): Attributes<"AlbumChangeNotification">["user"] {
    return new ParsePointer(
      this._albumChangeNotification.get(
        ParseAlbumChangeNotification.COLUMNS.user
      )
    );
  }

  get count(): Attributes<"AlbumChangeNotification">["count"] {
    return this._albumChangeNotification.get(
      ParseAlbumChangeNotification.COLUMNS.count
    );
  }

  set count(count) {
    this._albumChangeNotification.set(
      ParseAlbumChangeNotification.COLUMNS.count,
      count
    );
  }

  get owner(): Attributes<"AlbumChangeNotification">["owner"] {
    return new ParsePointer(
      this._albumChangeNotification.get(
        ParseAlbumChangeNotification.COLUMNS.owner
      )
    );
  }

  get attributes(): Attributes<"AlbumChangeNotification"> {
    return {
      ...this._albumChangeNotification.attributes,
      album: this.album,
      user: this.user,
      count: this.count,
      owner: this.owner,
    };
  }

  async save(options?: Parse.Object.SaveOptions) {
    return this._albumChangeNotification.save(null, options);
  }
}

/** Class for unpersisted AlbumChangeNotification objects */
export class UnpersistedParseAlbumChangeNotification extends ParseAlbumChangeNotification {
  constructor(attributes: Partial<Attributes<"AlbumChangeNotification">> = {}) {
    super(
      new Parse.Object<ParsifyPointers<"AlbumChangeNotification">>(
        "AlbumChangeNotification",
        // @ts-expect-error
        {
          count: 0,
          ...attributes,
          owner: attributes.owner?.toNativePointer() ?? {
            __type: "Pointer",
            className: "_User",
            objectId: "",
          },
          user: attributes.user?.toNativePointer() ?? {
            __type: "Pointer",
            className: "_User",
            objectId: "",
          },
          album: attributes.album?.toNativePointer() ?? {
            __type: "Pointer",
            className: "Album",
            objectId: "",
          },
        }
      )
    );
  }

  get objectId(): Attributes<"AlbumChangeNotification">["objectId"] {
    console.debug("Unpersisted albumChangeNotification has no id");
    return "new";
  }

  get createdAt(): Attributes<"AlbumChangeNotification">["createdAt"] {
    console.debug("Unpersisted albumChangeNotification has no createdAt");
    return new Date();
  }

  get updatedAt(): Attributes<"AlbumChangeNotification">["updatedAt"] {
    console.debug("Unpersisted albumChangeNotification has no updatedAt");
    return new Date();
  }
}
