import {get, set, del} from "idb-keyval";

class IdbKeyvalStorage {
  getItem = async (key: string) => {
    const val = await get(key);
    if (val) {
      return val;
    }
    return null;
  };
  setItem = set;
  removeItem = del;
};

export default IdbKeyvalStorage;
