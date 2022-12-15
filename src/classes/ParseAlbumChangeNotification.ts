import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, {Attributes, Columns, ParsifyPointers} from "./ParseObject";

/** Interface defining AlbumChangeNotification-specific attributes */
export interface AlbumChangeNotificationAttributes {
  /** Album that was changed */
  album: ParsePointer<"Album">,
  /** User that changed the album */
  user: ParsePointer<"_User">,
  /** The number of unacknowledged changes */
  count: number,
  /** User that "owns" this notification */
  owner: ParsePointer<"_User">,
}

class AlbumChangeNotificationColumns extends Columns {
  album: "album" = "album";
  user: "user" = "user";
  count: "count" = "count";
  owner: "owner" = "owner";
}

/**
 * Class wrapping the Parse.AlbumChangeNotification class and providing convenience methods/properties
 */
export default class ParseAlbumChangeNotification extends ParseObject<"AlbumChangeNotification"> {
  static COLUMNS = new AlbumChangeNotificationColumns();

  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.Object<ParsifyPointers<"AlbumChangeNotification">>>("AlbumChangeNotification");
    }
    return new Parse.Query<Parse.Object<ParsifyPointers<"AlbumChangeNotification">>>("AlbumChangeNotification").fromLocalDatastore();
  }

  _albumChangeNotification: Parse.Object<ParsifyPointers<"AlbumChangeNotification">>;

  constructor(albumChangeNotification: Parse.Object<ParsifyPointers<"AlbumChangeNotification">>) {
    super(albumChangeNotification);
    this._albumChangeNotification = albumChangeNotification;
  }

  async acknowledge() {
    this.count = 0;
    await this._albumChangeNotification.save();
  }

  get album(): Attributes<"AlbumChangeNotification">["album"] {
    return new ParsePointer(this._albumChangeNotification.get(ParseAlbumChangeNotification.COLUMNS.album));
  }

  get user(): Attributes<"AlbumChangeNotification">["user"] {
    return new ParsePointer(this._albumChangeNotification.get(ParseAlbumChangeNotification.COLUMNS.user));
  }

  get count(): Attributes<"AlbumChangeNotification">["count"] {
    return this._albumChangeNotification.get(ParseAlbumChangeNotification.COLUMNS.count);
  }

  set count(count) {
    this._albumChangeNotification.set(ParseAlbumChangeNotification.COLUMNS.count, count);
  }

  get owner(): Attributes<"AlbumChangeNotification">["owner"] {
    return new ParsePointer(this._albumChangeNotification.get(ParseAlbumChangeNotification.COLUMNS.owner));
  }

  get id(): Attributes<"AlbumChangeNotification">["objectId"] {
    return this._albumChangeNotification.id;
  }

  get attributes(): Attributes<"AlbumChangeNotification"> {
    return {
      album: this.album,
      user: this.user,
      count: this.count,
      owner: this.owner,
      objectId: this.id,
    };
  }
}