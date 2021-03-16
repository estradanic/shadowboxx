import {JsonDB} from "node-json-db";
import {Config} from "node-json-db/dist/lib/JsonDBConfig";
import * as AsyncLock from "async-lock";

const lock = new AsyncLock({timeout: 5000});
const DATABASE_LOCK_KEY = "database";

const database = new JsonDB(new Config("data/database", true, false, "/"));

const sanitizeKey = (key: string) =>
  "/" + key.replace("_", "__").replace("/", "_");

export const put = async (key: string, value: unknown) => {
  await lock.acquire(DATABASE_LOCK_KEY, () =>
    database.push(sanitizeKey(key), value),
  );
};

export const get = async <V>(key: string): Promise<V> => {
  try {
    const data = await lock.acquire(DATABASE_LOCK_KEY, () =>
      database.getData(sanitizeKey(key)),
    );
    return data;
  } catch {
    return null;
  }
};

export const merge = async (
  key: string,
  value: Array<unknown> | Record<string, unknown>,
) => {
  return await lock.acquire(DATABASE_LOCK_KEY, () =>
    database.push(sanitizeKey(key), value, false),
  );
};

export const drop = async (key: string) => {
  return await lock.acquire(DATABASE_LOCK_KEY, () =>
    database.delete(sanitizeKey(key)),
  );
};
