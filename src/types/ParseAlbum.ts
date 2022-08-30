import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, { Attributes, ParsifyPointers } from "./ParseObject";

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
  /** Collaborators with "put" access */
  collaborators: string[];
  /** Collaborators with "view" access */
  viewers: string[];
  /** First image in album, or user selected cover image */
  coverImage: ParsePointer;
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
    collaborators: "collaborators",
    viewers: "viewers",
    coverImage: "coverImage",
  };

  static NULL = new ParseAlbum(
    new Parse.Object<ParsifyPointers<Album>>("Album", {
      owner: ParsePointer.NATIVE_NULL,
      images: [],
      name: "",
      collaborators: [],
      viewers: [],
      coverImage: ParsePointer.NATIVE_NULL,
    })
  );

  static sort(albums: ParseAlbum[], favoriteAlbums?: string[]) {
    return [...albums].sort((a, b) => {
      if (favoriteAlbums) {
        if (a.id && favoriteAlbums.includes(a.id)) {
          return -1;
        } else if (b.id && favoriteAlbums.includes(b.id)) {
          return 1;
        }
      }
      return a.compareTo(b);
    });
  }

  static query() {
    return new Parse.Query<Parse.Object<ParsifyPointers<Album>>>("Album");
  }

  static fromAttributes(attributes: Album): ParseAlbum {
    const newAttributes: ParsifyPointers<Album> = {
      ...attributes,
      owner: attributes.owner._pointer,
      coverImage: attributes.coverImage._pointer,
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

  compareTo(that: ParseAlbum): number {
    return this.name.localeCompare(that.name);
  }

  async save() {
    return new ParseAlbum(await this._album.save());
  }

  async update(attributes: Album) {
    const newAttributes: ParsifyPointers<Album> = {
      ...attributes,
      owner: attributes.owner._pointer,
      coverImage: attributes.coverImage._pointer,
    };
    this._album.set(newAttributes);
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

  get coverImage(): Album["coverImage"] {
    return new ParsePointer(this._album.get(ParseAlbum.COLUMNS.coverImage));
  }

  set coverImage(coverImage) {
    this._album.set(ParseAlbum.COLUMNS.coverImage, coverImage._pointer);
  }
}
