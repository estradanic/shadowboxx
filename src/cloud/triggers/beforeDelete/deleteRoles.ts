import loggerWrapper from "../../loggerWrapper";
import { ParseAlbum } from "../../shared";

/** Function to delete roles associated with this album */
const deleteRoles = async (album: ParseAlbum) => {
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

export default loggerWrapper("deleteRoles", deleteRoles);
