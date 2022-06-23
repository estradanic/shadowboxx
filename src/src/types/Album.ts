import Parse from "parse";
import ParsePointer from "./Pointer";
import Object, { Attributes } from "./Object";

/** Interface defining an Album */
export interface Album extends Attributes {
  /** User that owns this album */
  owner: ParsePointer;
  /** Images in the album */
  images: string[];
  /** Name of the album */
  name: string;
  /** Description of the album */
  description?: string;
  /** Whether the album is "favorite" or not */
  isFavorite?: boolean;
  /** Whether the album is publicly viewable or not */
  isPublic?: boolean;
  /** Collaborators with "put" access */
  collaborators: string[];
  /** Collaborators with "view" access */
  viewers: string[];
  /** Collaborators with "edit" access */
  coOwners: string[];
  /** Last edited date */
  updatedAt?: Date;
  /** Created date */
  createdAt?: Date;
}

/**
 * Class wrapping the Parse.Album class and providing convenience methods/properties
 */
export default class ParseAlbum extends Object<Album> {
  static COLUMNS: { [key: string]: string } = {
    ...Object.COLUMNS,
    owner: "owner",
    images: "images",
    name: "name",
    description: "description",
    isFavorite: "isFavorite",
    isPublic: "isPublic",
    collaborators: "collaborators",
    coOwners: "coOwners",
    viewers: "viewers",
  };

  static query() {
    return new Parse.Query<Parse.Object<Album>>("Album");
  }

  static fromAttributes(attributes: Album) {
    return new ParseAlbum(new Parse.Object<Album>("Album", attributes));
  }

  _album: Parse.Object<Album>;

  constructor(album: Parse.Object<Album>) {
    super(album);
    this._album = album;
  }

  async update(attributes: Album) {
    this._album.set(attributes);
    return this.save();
  }

  async save() {
    return new ParseAlbum(await this._album.save());
  }

  async destroy() {
    return await this._album.destroy();
  }

  get owner(): Album["owner"] {
    return new ParsePointer(this._album.get(ParseAlbum.COLUMNS.owner));
  }

  set owner(owner) {
    this._album.set(ParseAlbum.COLUMNS.owner, owner._pointer);
  }

  get images(): Album["images"] {
    return this._album.get(ParseAlbum.COLUMNS.images);
  }

  set images(images) {
    this._album.set(ParseAlbum.COLUMNS.images, images);
  }

  get name(): Album["name"] {
    return this._album.get(ParseAlbum.COLUMNS.name);
  }

  set name(name) {
    this._album.set(ParseAlbum.COLUMNS.name, name);
  }

  get description(): Album["description"] {
    return this._album.get(ParseAlbum.COLUMNS.description);
  }

  set description(description) {
    this._album.set(ParseAlbum.COLUMNS.description, description);
  }

  get isFavorite(): Album["isFavorite"] {
    return this._album.get(ParseAlbum.COLUMNS.isFavorite);
  }

  set isFavorite(isFavorite) {
    this._album.set(ParseAlbum.COLUMNS.isFavorite, isFavorite);
  }

  get isPublic(): Album["isPublic"] {
    return this._album.get(ParseAlbum.COLUMNS.isPublic);
  }

  set isPublic(isPublic) {
    this._album.set(ParseAlbum.COLUMNS.isPublic, isPublic);
  }

  get collaborators(): Album["collaborators"] {
    return this._album.get(ParseAlbum.COLUMNS.collaborators);
  }

  set collaborators(collaborators) {
    this._album.set(ParseAlbum.COLUMNS.collaborators, collaborators);
  }

  get viewers(): Album["viewers"] {
    return this._album.get(ParseAlbum.COLUMNS.viewers);
  }

  set viewers(viewers) {
    this._album.set(ParseAlbum.COLUMNS.viewers, viewers);
  }

  get coOwners(): Album["coOwners"] {
    return this._album.get(ParseAlbum.COLUMNS.coOwners);
  }

  set coOwners(coOwners) {
    this._album.set(ParseAlbum.COLUMNS.coOwners, coOwners);
  }
}
