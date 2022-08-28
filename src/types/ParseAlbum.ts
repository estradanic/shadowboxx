import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, { Attributes, ParsifyPointers } from "./ParseObject";
import ParseUser from "./ParseUser";

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
  /** Collaborators with "put" access */
  collaborators: string[];
  /** Collaborators with "view" access */
  viewers: string[];
  /** Last edited date */
  updatedAt?: Date;
  /** Created date */
  createdAt?: Date;
}

/**
 * Class wrapping the Parse.Album class and providing convenience methods/properties
 */
export default class ParseAlbum extends ParseObject<Album> {
  static COLUMNS: { [key: string]: string } = {
    ...ParseObject.COLUMNS,
    owner: "owner",
    images: "images",
    name: "name",
    description: "description",
    isFavorite: "isFavorite",
    collaborators: "collaborators",
    viewers: "viewers",
  };

  static NULL = new ParseAlbum(
    new Parse.Object<ParsifyPointers<Album>>("Album", {
      owner: { objectId: "", className: "Album", __type: "" },
      images: [],
      name: "",
      collaborators: [],
      viewers: [],
    })
  );

  static query() {
    return new Parse.Query<Parse.Object<ParsifyPointers<Album>>>("Album");
  }

  static fromAttributes(attributes: Album): ParseAlbum {
    const newAttributes: ParsifyPointers<Album> = {
      ...attributes,
      owner: attributes.owner._pointer,
    };
    return new ParseAlbum(
      new Parse.Object<ParsifyPointers<Album>>("Album", newAttributes)
    );
  }

  _album: Parse.Object<ParsifyPointers<Album>>;

  constructor(album: Parse.Object<ParsifyPointers<Album>>) {
    super(album);
    this._album = album;
  }

  async save() {
    return new ParseAlbum(await this._album.save());
  }

  async update(attributes: Album) {
    this._album.set(attributes);
    return this.save();
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
}
