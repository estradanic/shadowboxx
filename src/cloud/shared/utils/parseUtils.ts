import { ClassName, ParseObject, ParsePointer } from "../classes";

export const getObjectId = (
  entity?:
    | Parse.Pointer
    | Parse.Object
    | ParseObject<ClassName>
    | ParsePointer<ClassName>
): string => {
  return (entity as any)?.objectId ?? (entity as any)?.id;
};
