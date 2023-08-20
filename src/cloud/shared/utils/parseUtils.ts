import { ClassName, ParseObject, ParsePointer } from "../classes";

/** Get the object id of a Parse.Object, Parse.Pointer, or ParseObject */
export const getObjectId = (
  entity?:
    | Parse.Pointer
    | Parse.Object
    | ParseObject<ClassName>
    | ParsePointer<ClassName>
): string => {
  return (entity as any)?.objectId ?? (entity as any)?.id;
};
