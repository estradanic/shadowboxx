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
  album: Parse.Object<Album>;

  constructor(album: Parse.Object<Album>) {
    super(album);
    this.album = album;
  }

  get owner(): Parse.Pointer {
    return this.album.get("owner");
  }

  set owner(owner) {
    this.album.set("owner", owner);
  }

  get images(): Parse.Relation<Parse.Object<Album>, Parse.Object<Image>> {
    return this.album.get("images");
  }

  set images(images) {
    this.album.set("images", images);
  }

  get name(): string {
    return this.album.get("name");
  }

  set name(name) {
    this.album.set("name", name);
  }

  get description(): string | undefined {
    return this.album.get("description");
  }

  set description(description) {
    this.album.set("description", description);
  }

  get isFavorite(): boolean | undefined {
    return this.album.get("isFavorite");
  }

  set isFavorite(isFavorite) {
    this.album.set("isFavorite", isFavorite);
  }

  get isPublic(): boolean | undefined {
    return this.album.get("isPublic");
  }

  set isPublic(isPublic) {
    this.album.set("isPublic", isPublic);
  }

  get collaborators(): Parse.Relation<Parse.Object<Album>, Parse.User<User>> {
    return this.album.get("collaborators");
  }

  set collaborators(collaborators) {
    this.album.set("collaborators", collaborators);
  }

  get viewers(): Parse.Relation<Parse.Object<Album>, Parse.User<User>> {
    return this.album.get("collaborators");
  }

  set viewers(collaborators) {
    this.album.set("collaborators", collaborators);
  }

  get coOwners(): Parse.Relation<Parse.Object<Album>, Parse.User<User>> {
    return this.album.get("collaborators");
  }

  set coOwners(collaborators) {
    this.album.set("collaborators", collaborators);
  }
}
