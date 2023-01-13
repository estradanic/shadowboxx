import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, { Attributes, Columns, ParsifyPointers } from "./ParseObject";

/** Interface defining Album-specific attributes */
export interface AlbumAttributes {
  /** User that owns the album */
  owner: ParsePointer<"_User">;
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
  coverImage?: ParsePointer<"Image">;
  /** Map of image id to captions */
  captions: { [imageId: string]: string };
}

export interface AlbumSaveContext {
  /** Array of image ids removed from the album */
  removedImages?: string[];
  /** Array of image ids added to the album */
  addedImages?: string[];
  /** Array of collaborator emails removed from the album */
  removedCollaborators?: string[];
  /** Array of collaborator emails added to the album */
  addedCollaborators?: string[];
  /** Array of viewer emails added to the album */
  removedViewers?: string[];
  /** Array of viewer emails removed from the album */
  addedViewers?: string[];
  /** New cover image for the album */
  coverImage?: AlbumAttributes["coverImage"];
  /** New name for the album */
  name?: AlbumAttributes["name"];
  /** New description for the album */
  description?: AlbumAttributes["description"];
  /** New captions for the album */
  captions?: AlbumAttributes["captions"];
}

class AlbumColumns extends Columns {
  owner: "owner" = "owner";
  images: "images" = "images";
  name: "name" = "name";
  description: "description" = "description";
  collaborators: "collaborators" = "collaborators";
  viewers: "viewers" = "viewers";
  coverImage: "coverImage" = "coverImage";
  captions: "captions" = "captions";
}

/**
 * Class wrapping the Parse.Album class and providing convenience methods/properties
 */
export default class ParseAlbum extends ParseObject<"Album"> {
  static COLUMNS = new AlbumColumns();

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

  static query(online = true) {
    console.log("Album", {online});
    if (online) {
      return new Parse.Query<Parse.Object<ParsifyPointers<"Album">>>("Album");
    }
    return new Parse.Query<Parse.Object<ParsifyPointers<"Album">>>("Album").fromLocalDatastore();
  }

  static fromAttributes(attributes: Attributes<"Album">): ParseAlbum {
    const newAttributes: ParsifyPointers<"Album"> = {
      ...attributes,
      owner: attributes.owner._pointer,
      coverImage: attributes.coverImage?._pointer,
    };
    return new ParseAlbum(
      new Parse.Object<ParsifyPointers<"Album">>("Album", newAttributes)
    );
  }

  _album: Parse.Object<ParsifyPointers<"Album">>;

  constructor(album: Parse.Object<ParsifyPointers<"Album">>) {
    super(album);
    this._album = album;
    this.pin();
  }

  compareTo(that: ParseAlbum): number {
    return this.name.localeCompare(that.name);
  }

  async save(context: AlbumSaveContext) {
    return new ParseAlbum(await this._album.save(null, { context }));
  }

  async saveNew() {
    return this.save({});
  }

  async update(attributes: Attributes<"Album">, changes: AlbumSaveContext) {
    const newAttributes: ParsifyPointers<"Album"> = {
      ...attributes,
      owner: attributes.owner._pointer,
      coverImage: attributes.coverImage?._pointer,
    };
    this._album.set(newAttributes);
    return this.save(changes);
  }

  /** Pointer to the owner of this album */
  get owner(): Attributes<"Album">["owner"] {
    return new ParsePointer(this._album.get(ParseAlbum.COLUMNS.owner));
  }

  set owner(owner) {
    this._album.set(ParseAlbum.COLUMNS.owner, owner._pointer);
  }

  /** List of image ids */
  get images(): Attributes<"Album">["images"] {
    return this._album.get(ParseAlbum.COLUMNS.images);
  }

  set images(images) {
    this._album.set(ParseAlbum.COLUMNS.images, images);
  }

  /** Name of the album */
  get name(): Attributes<"Album">["name"] {
    return this._album.get(ParseAlbum.COLUMNS.name);
  }

  set name(name) {
    this._album.set(ParseAlbum.COLUMNS.name, name);
  }

  /** Description for this album */
  get description(): Attributes<"Album">["description"] {
    return this._album.get(ParseAlbum.COLUMNS.description);
  }

  set description(description) {
    this._album.set(ParseAlbum.COLUMNS.description, description);
  }

  /** List of collaborator emails */
  get collaborators(): Attributes<"Album">["collaborators"] {
    return this._album.get(ParseAlbum.COLUMNS.collaborators);
  }

  set collaborators(collaborators) {
    this._album.set(ParseAlbum.COLUMNS.collaborators, collaborators);
  }

  /** List of viewer emails */
  get viewers(): Attributes<"Album">["viewers"] {
    return this._album.get(ParseAlbum.COLUMNS.viewers);
  }

  set viewers(viewers) {
    this._album.set(ParseAlbum.COLUMNS.viewers, viewers);
  }

  /** Pointer to the cover image for this album */
  get coverImage(): Attributes<"Album">["coverImage"] {
    const coverImage = this._album.get(ParseAlbum.COLUMNS.coverImage)
    if (coverImage) {
      return new ParsePointer(coverImage);
    }
    return new ParsePointer({
      objectId: this.images[0],
      className: "Image",
      __type: "Object",
    });
  }

  set coverImage(coverImage) {
    this._album.set(ParseAlbum.COLUMNS.coverImage, coverImage?._pointer);
  }

  /** Map of image ids to captions */
  get captions(): Attributes<"Album">["captions"] {
    return this._album.get(ParseAlbum.COLUMNS.captions);
  }

  set captions(captions) {
    this._album.set(ParseAlbum.COLUMNS.captions, captions);
  }

  /** Function to set caption for an image */
  setCaption(imageId: string, caption: string) {
    this.captions[imageId] = caption;
    this._album.set(ParseAlbum.COLUMNS.captions, this.captions);
  }

  /** Get caption for an image */
  getCaption(imageId: string): string {
    return this.captions[imageId];
  }

  /** Attributes for this album */
  get attributes(): Attributes<"Album"> {
    return {
      ...this._album.attributes,
      owner: this.owner,
      coverImage: this.coverImage,
    };
  }
}
