import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, {
  Attributes,
  Columns,
  ParsifyPointers,
} from "./ParseObject";

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
  removedImages?: ParsifyPointers<"Album">["images"];
  /** Array of image ids added to the album */
  addedImages?: ParsifyPointers<"Album">["images"];
  /** Array of collaborator emails removed from the album */
  removedCollaborators?: ParsifyPointers<"Album">["collaborators"];
  /** Array of collaborator emails added to the album */
  addedCollaborators?: ParsifyPointers<"Album">["collaborators"];
  /** Array of viewer emails added to the album */
  removedViewers?: ParsifyPointers<"Album">["viewers"];
  /** Array of viewer emails removed from the album */
  addedViewers?: ParsifyPointers<"Album">["viewers"];
  /** New cover image for the album */
  coverImage?: ParsifyPointers<"Album">["coverImage"];
  /** New name for the album */
  name?: ParsifyPointers<"Album">["name"];
  /** New description for the album */
  description?: ParsifyPointers<"Album">["description"];
  /** New captions for the album */
  captions?: ParsifyPointers<"Album">["captions"];
}

class AlbumColumns extends Columns {
  /** User that owns the album */
  owner = "owner" as const;
  /** Images in the album */
  images = "images" as const;
  /** Name of the album */
  name = "name" as const;
  /** Description of the album */
  description = "description" as const;
  /** Collaborators with "put" access */
  collaborators = "collaborators" as const;
  /** Collaborators with "view" access */
  viewers = "viewers" as const;
  /** First image in album, or user selected cover image */
  coverImage = "coverImage" as const;
  /** Map of image id to captions */
  captions = "captions" as const;
}

/**
 * Class wrapping the Parse.Album class and providing convenience methods/properties
 */
export default class ParseAlbum extends ParseObject<"Album"> {
  /** Columns for the Album class */
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

  /**
   * Create a new Parse.Query for Albums. For client code only.
   * @param online Whether to query online or from local datastore
   * @returns Parse.Query for Albums
   */
  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.Object<ParsifyPointers<"Album">>>("Album");
    }
    return new Parse.Query<Parse.Object<ParsifyPointers<"Album">>>(
      "Album"
    ).fromLocalDatastore();
  }

  /**
   * Create a new Parse.Query for Albums. For cloud code only.
   * @param parse Parse instance
   * @returns Parse.Query for Albums
   */
  static cloudQuery(parse: typeof Parse) {
    return new parse.Query<Parse.Object<ParsifyPointers<"Album">>>("Album");
  }

  private _album: Parse.Object<ParsifyPointers<"Album">>;

  constructor(album: Parse.Object<ParsifyPointers<"Album">>, noPin: boolean = false) {
    super(album);
    this._album = album;
    if (!noPin) {
      this.pin();
    }
  }

  compareTo(that: ParseAlbum): number {
    return this.name.localeCompare(that.name);
  }

  private async save(context: AlbumSaveContext) {
    return new ParseAlbum(await this._album.save(null, { context }));
  }

  async cloudSave(options?: Parse.Object.SaveOptions) {
    return new ParseAlbum(await this._album.save(null, options), true);
  }

  existed() {
    return this._album.existed();
  }

  async saveNew() {
    return this.save({
      addedImages: this.images,
      addedCollaborators: this.collaborators,
      addedViewers: this.viewers,
      coverImage: this.coverImage?.toNativePointer(),
      name: this.name,
      description: this.description,
      captions: this.captions,
    });
  }

  async update(attributes: AlbumAttributes, changes: AlbumSaveContext) {
    const newAttributes: ParsifyPointers<"Album"> = {
      ...attributes,
      owner: attributes.owner.toNativePointer(),
      coverImage: attributes.coverImage?.toNativePointer(),
      objectId: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
    this._album.set(newAttributes);
    return this.save(changes);
  }

  /** Pointer to the owner of this album */
  get owner(): Attributes<"Album">["owner"] {
    return new ParsePointer(this._album.get(ParseAlbum.COLUMNS.owner));
  }

  set owner(owner) {
    this._album.set(ParseAlbum.COLUMNS.owner, owner.toNativePointer());
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
    const coverImage = this._album.get(ParseAlbum.COLUMNS.coverImage);
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
    this._album.set(
      ParseAlbum.COLUMNS.coverImage,
      coverImage?.toNativePointer()
    );
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

export class UnpersistedParseAlbum extends ParseAlbum {
  constructor(attributes: Partial<Attributes<"Album">> = {}) {
    super(
      // @ts-expect-error
      new Parse.Object<ParsifyPointers<"Album">>("Album", {
        images: [],
        name: "",
        collaborators: [],
        viewers: [],
        captions: {},
        ...attributes,
        owner: attributes.owner?.toNativePointer() ?? {
          __type: "Pointer",
          className: "_User",
          objectId: "",
        },
        coverImage: attributes.coverImage?.toNativePointer(),
      })
    );
  }

  get id(): Attributes<"Album">["objectId"] {
    console.warn("Unpersisted album has no id");
    return "";
  }

  get createdAt(): Attributes<"Album">["createdAt"] {
    console.warn("Unpersisted album has no createdAt");
    return new Date();
  }

  get updatedAt(): Attributes<"Album">["updatedAt"] {
    console.warn("Unpersisted album has no updatedAt");
    return new Date();
  }
}
