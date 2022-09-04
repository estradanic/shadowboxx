import { Album } from "../../../types";

const deleteRoles = async (album: Parse.Object<Album>) => {
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
