import Parse from "parse";
import { ParseImage } from "./Image";
import Object, { Attributes } from "./ParseObject";
import { User } from "./User";

/** Interface defining an Album */
export interface Album extends Attributes {
  /** User that owns this album */
  owner: Parse.Pointer;
  /** Images in the album */
  images: Parse.Relation<ParseAlbum, ParseImage>;
  /** Name of the album */
  name: string;
  /** Description of the album */
  description?: string;
  /** Whether the album is "favorite" or not */
  isFavorite?: boolean;
  /** Whether the album is publicly viewable or not */
  isPublic?: boolean;
  /** Collaborators with "put" access */
  collaborators: Parse.Relation<ParseAlbum, Parse.User<User>>;
  /** Collaborators with "view" access */
  viewers: Parse.Relation<ParseAlbum, Parse.User<User>>;
  /** Collaborators with "edit" access */
  coOwners: Parse.Relation<ParseAlbum, Parse.User<User>>;
  /** Last edited date */
  updatedAt?: Date;
  /** Created date */
  createdAt?: Date;
}

export class ParseAlbum extends Object<Album> {
  get owner(): Parse.Pointer {
    return this.get("owner");
  }

  set owner(owner) {
    this.set("owner", owner);
  }

  get images(): Parse.Relation<ParseAlbum, ParseImage> {
    return this.get("images");
  }

  set images(images) {
    this.set("images", images);
  }

  get name(): string {
    return this.get("name");
  }

  set name(name) {
    this.set("name", name);
  }

  get description(): string | undefined {
    return this.get("description");
  }

  set description(description) {
    this.set("description", description);
  }

  get isFavorite(): boolean | undefined {
    return this.get("isFavorite");
  }

  set isFavorite(isFavorite) {
    this.set("isFavorite", isFavorite);
  }

  get isPublic(): boolean | undefined {
    return this.get("isPublic");
  }

  set isPublic(isPublic) {
    this.set("isPublic", isPublic);
  }

  get collaborators(): Parse.Relation<ParseAlbum, Parse.User<User>> {
    return this.get("collaborators");
  }

  set collaborators(collaborators) {
    this.set("collaborators", collaborators);
  }

  get viewers(): Parse.Relation<ParseAlbum, Parse.User<User>> {
    return this.get("collaborators");
  }

  set viewers(collaborators) {
    this.set("collaborators", collaborators);
  }

  get coOwners(): Parse.Relation<ParseAlbum, Parse.User<User>> {
    return this.get("collaborators");
  }

  set coOwners(collaborators) {
    this.set("collaborators", collaborators);
  }
}
