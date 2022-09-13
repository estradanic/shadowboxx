import {get, set, del} from "idb-keyval";

class IdbKeyvalStorage {
  getItem = async (key: string) => await get(key) ?? null;
  setItem = set;
  removeItem = del;
};

export default IdbKeyvalStorage;
