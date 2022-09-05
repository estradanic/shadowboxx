const deleteRoles = async (album: Parse.Object) => {
  const readRole = await new Parse.Query(Parse.Role)
    .equalTo("name", `${album.id}_r`)
    .first({ useMasterKey: true });
  const readWriteRole = await new Parse.Query(Parse.Role)
    .equalTo("name", `${album.id}_rw`)
    .first({ useMasterKey: true });

  if (readRole) {
    await readRole.destroy({ useMasterKey: true });
  }
  if (readWriteRole) {
    await readWriteRole.destroy({ useMasterKey: true });
  }
};

export default deleteRoles;
