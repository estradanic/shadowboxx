import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, {
  Attributes,
  Columns,
  ObjectAttributes,
  ParsifyPointers,
} from "./ParseObject";
import ParseQuery from "./ParseQuery";

/** Interface defining Album-specific attributes */
export interface AlbumAttributes extends Partial<ObjectAttributes> {
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

type AlbumKeys = Required<{
  [key in keyof AlbumAttributes]: key;
}>;

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

class AlbumColumns extends Columns implements AlbumKeys {
  owner = "owner" as const;
  images = "images" as const;
  name = "name" as const;
  description = "description" as const;
  collaborators = "collaborators" as const;
  viewers = "viewers" as const;
  coverImage = "coverImage" as const;
  captions = "captions" as const;
}

/**
 * Class wrapping the Parse.Album class and providing convenience methods/properties
 */
export default class ParseAlbum
  extends ParseObject<"Album">
  implements AlbumAttributes
{
  /** Columns for the Album class */
  static COLUMNS = new AlbumColumns();

  /**
   * Create a new Parse.Query for Albums. For client code only.
   * @param online Whether to query online or from local datastore
   * @returns Parse.Query for Albums
   */
  static query(online = true) {
    let nativeQuery = new Parse.Query<Parse.Object<ParsifyPointers<"Album">>>(
      "Album"
    );
    if (!online) {
      nativeQuery.fromLocalDatastore();
    }
    return new ParseQuery(nativeQuery, false);
  }

  /**
   * Create a new Parse.Query for Albums. For cloud code only.
   * @param parse Parse instance
   * @returns Parse.Query for Albums
   */
  static cloudQuery(parse: typeof Parse) {
    return ParseQuery.for("Album", parse);
  }

  protected _album: Parse.Object<ParsifyPointers<"Album">>;

  constructor(
    album: Parse.Object<ParsifyPointers<"Album">>,
    cloud: boolean = false
  ) {
    super(album, cloud);
    this._album = album;
    if (!cloud) {
      this.pin();
    }
  }

  /** Compare to another ParseAlbum by name */
  compareTo(that: ParseAlbum): number {
    return this.name.localeCompare(that.name);
  }

  private async save(context: AlbumSaveContext) {
    return new ParseAlbum(await this._album.save(null, { context }));
  }

  /**
   * Call the underlying Parse save function with the given options
   * Only for use in cloud code
   */
  async cloudSave(options?: Parse.Object.SaveOptions) {
    return new ParseAlbum(await this._album.save(null, options), true);
  }

  /**
   * Whether this album existed before this cloud code run.
   * Only for use in cloud code
   */
  existed() {
    return this._album.existed();
  }

  /**
   * Save this as a new album with no id yet
   * Only for use in client code
   */
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

  /**
   * Update this album with the given changes
   * Only for use in client code
   */
  async update(attributes: AlbumAttributes, changes: AlbumSaveContext) {
    const newAttributes: ParsifyPointers<"Album"> = {
      ...attributes,
      owner: attributes.owner.toNativePointer(),
      coverImage: attributes.coverImage?.toNativePointer(),
      objectId: this.objectId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
    this._album.set(newAttributes);
    return this.save(changes);
  }

  get owner() {
    return new ParsePointer<"_User">(this._album.get(ParseAlbum.COLUMNS.owner));
  }

  set owner(owner) {
    this._album.set(ParseAlbum.COLUMNS.owner, owner.toNativePointer());
  }

  get images() {
    return this._album.get(ParseAlbum.COLUMNS.images);
  }

  set images(images) {
    this._album.set(ParseAlbum.COLUMNS.images, images);
  }

  get name() {
    return this._album.get(ParseAlbum.COLUMNS.name);
  }

  set name(name) {
    this._album.set(ParseAlbum.COLUMNS.name, name);
  }

  get description() {
    return this._album.get(ParseAlbum.COLUMNS.description);
  }

  set description(description) {
    this._album.set(ParseAlbum.COLUMNS.description, description);
  }

  get collaborators() {
    return this._album.get(ParseAlbum.COLUMNS.collaborators);
  }

  set collaborators(collaborators) {
    this._album.set(ParseAlbum.COLUMNS.collaborators, collaborators);
  }

  get viewers() {
    return this._album.get(ParseAlbum.COLUMNS.viewers);
  }

  set viewers(viewers) {
    this._album.set(ParseAlbum.COLUMNS.viewers, viewers);
  }

  get coverImage() {
    const coverImage = this._album.get(ParseAlbum.COLUMNS.coverImage);
    if (coverImage) {
      return new ParsePointer<"Image">(coverImage);
    } else if (this.images[0]) {
      return new ParsePointer<"Image">({
        objectId: this.images[0],
        className: "Image",
        __type: "Pointer",
      });
    }
    return undefined;
  }

  set coverImage(coverImage) {
    this._album.set(
      ParseAlbum.COLUMNS.coverImage,
      coverImage?.toNativePointer()
    );
  }

  get captions() {
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
  getCaption(imageId: string): string | undefined {
    return this.captions[imageId];
  }

  /** Attributes for this album */
  get attributes(): Attributes<"Album"> {
    return {
      ...this._album.attributes,
      owner: this.owner,
      coverImage: this.coverImage,
      objectId: this.objectId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  set attributes(
    attributes: Omit<
      Attributes<"Album">,
      "objectId" | "createdAt" | "updatedAt"
    >
  ) {
    this._album.set({
      ...attributes,
      owner: attributes.owner.toNativePointer(),
      coverImage: attributes.coverImage?.toNativePointer(),
    });
  }
}

/** Class for unpersisted ParseAlbums */
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

  get objectId(): Attributes<"Album">["objectId"] {
    console.debug("UnpersistedParseAlbum has no id");
    return "new";
  }

  get createdAt(): Attributes<"Album">["createdAt"] {
    console.debug("UnpersistedParseAlbum has no createdAt");
    return new Date();
  }

  get updatedAt(): Attributes<"Album">["updatedAt"] {
    console.debug("UnpersistedParseAlbum has no updatedAt");
    return new Date();
  }
}
