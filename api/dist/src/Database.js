"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drop = exports.merge = exports.get = exports.put = void 0;
const node_json_db_1 = require("node-json-db");
const JsonDBConfig_1 = require("node-json-db/dist/lib/JsonDBConfig");
const AsyncLock = require("async-lock");
const lock = new AsyncLock({ timeout: 5000 });
const DATABASE_LOCK_KEY = "database";
const database = new node_json_db_1.JsonDB(new JsonDBConfig_1.Config("data/database", true, false, "/"));
const sanitizeKey = (key) => "/" + key.replace("_", "__").replace("/", "_");
exports.put = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
    yield lock.acquire(DATABASE_LOCK_KEY, () => database.push(sanitizeKey(key), value));
});
exports.get = (key) => __awaiter(void 0, void 0, void 0, function* () {
    return yield lock.acquire(DATABASE_LOCK_KEY, () => database.getData(sanitizeKey(key)));
});
exports.merge = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
    return yield lock.acquire(DATABASE_LOCK_KEY, () => database.push(sanitizeKey(key), value, false));
});
exports.drop = (key) => __awaiter(void 0, void 0, void 0, function* () {
    return yield lock.acquire(DATABASE_LOCK_KEY, () => database.delete(sanitizeKey(key)));
});
//# sourceMappingURL=Database.js.map