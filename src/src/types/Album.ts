import Parse from "parse";
import { ParseImage } from "./Image";
import Object, { Attributes } from "./ParseObject";
import { ParseUser } from "./User";

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
  collaborators: Parse.Relation<ParseAlbum, ParseUser>;
  /** Collaborators with "view" access */
  viewers: Parse.Relation<ParseAlbum, ParseUser>;
  /** Collaborators with "edit" access */
  coOwners: Parse.Relation<ParseAlbum, ParseUser>;
  /** Last edited date */
  updatedAt?: Date;
  /** Created date */
  createdAt?: Date;
}

// TODO ADD GETTERS AND SETTERS
export class ParseAlbum extends Object<Album> {}
