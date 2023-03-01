export const getObjectId = (entity?: Parse.Pointer): string => {
  return entity?.objectId ?? (entity as any)?.id;
};
