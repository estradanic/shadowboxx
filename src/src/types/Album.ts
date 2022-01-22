import Parse from "parse";
import { Image } from "./Image";
import Object, { Attributes } from "./ParseObject";
import { User } from "./User";

/** Interface defining an Album */
export interface Album extends Attributes {
  /** User that owns this album */
  owner: Parse.Pointer;
  /** Images in the album */
  images: Parse.Relation<Parse.Object<Album>, Parse.Object<Image>>;
  /** Name of the album */
  name: string;
  /** Description of the album */
  description?: string;
  /** Whether the album is "favorite" or not */
  isFavorite?: boolean;
  /** Whether the album is publicly viewable or not */
  isPublic?: boolean;
  /** Collaborators with "put" access */
  collaborators: Parse.Relation<Parse.Object<Album>, Parse.User<User>>;
  /** Collaborators with "view" access */
  viewers: Parse.Relation<Parse.Object<Album>, Parse.User<User>>;
  /** Collaborators with "edit" access */
  coOwners: Parse.Relation<Parse.Object<Album>, Parse.User<User>>;
  /** Last edited date */
  updatedAt?: Date;
  /** Created date */
  createdAt?: Date;
}

export class ParseAlbum extends Object<Album> {
  static fromAttributes(attributes: Album) {
    return new ParseAlbum(new Parse.Object<Album>("Album", attributes));
  }

  _album: Parse.Object<Album>;

  constructor(album: Parse.Object<Album>) {
    super(album);
    this._album = album;
  }

  async save() {
    return new ParseAlbum(await this._album.save());
  }

  async destroy() {
    return await this._album.destroy();
  }

  get owner(): Parse.Pointer {
    return this._album.get("owner");
  }

  set owner(owner) {
    this._album.set("owner", owner);
  }

  get images(): Parse.Relation<Parse.Object<Album>, Parse.Object<Image>> {
    return this._album.get("images");
  }

  set images(images) {
    this._album.set("images", images);
  }

  get name(): string {
    return this._album.get("name");
  }

  set name(name) {
    this._album.set("name", name);
  }

  get description(): string | undefined {
    return this._album.get("description");
  }

  set description(description) {
    this._album.set("description", description);
  }

  get isFavorite(): boolean | undefined {
    return this._album.get("isFavorite");
  }

  set isFavorite(isFavorite) {
    this._album.set("isFavorite", isFavorite);
  }

  get isPublic(): boolean | undefined {
    return this._album.get("isPublic");
  }

  set isPublic(isPublic) {
    this._album.set("isPublic", isPublic);
  }

  get collaborators(): Parse.Relation<Parse.Object<Album>, Parse.User<User>> {
    return this._album.get("collaborators");
  }

  set collaborators(collaborators) {
    this._album.set("collaborators", collaborators);
  }

  get viewers(): Parse.Relation<Parse.Object<Album>, Parse.User<User>> {
    return this._album.get("collaborators");
  }

  set viewers(collaborators) {
    this._album.set("collaborators", collaborators);
  }

  get coOwners(): Parse.Relation<Parse.Object<Album>, Parse.User<User>> {
    return this._album.get("collaborators");
  }

  set coOwners(collaborators) {
    this._album.set("collaborators", collaborators);
  }
}
