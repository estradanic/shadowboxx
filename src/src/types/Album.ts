import Parse from "parse";
import Image from "./Image";

/** Interface defining an Album */
export default interface Album {
  /** Unique Id of the album in the database */
  objectId?: string,
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
  collaborators?: Parse.Relation<Parse.Object<Album>, Parse.User>;
  /** Collaborators with "view" access */
  viewers?: Parse.Relation<Parse.Object<Album>, Parse.User>;
  /** Collaborators with "edit" access */
  coOwners?: Parse.Relation<Parse.Object<Album>, Parse.User>;
  /** Last edited date */
  updatedAt: Date;
  /** Created date */
  createdAt: Date;
}
