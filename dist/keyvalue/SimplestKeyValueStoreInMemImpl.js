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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplestKeyValueStoreInMemImpl = exports.EvictionMode = void 0;
exports.EvictionMode = {
    LRU: 'LRU'
};
var SimplestKeyValueStoreInMemImpl = (function () {
    function SimplestKeyValueStoreInMemImpl(options) {
        this.maxAggregateMemoryInBytes = options.maxAggregateMemoryInBytes;
        this.evictionMode = options.evictionMode;
        this.store = new Map();
        this.currentMemoryUsage = 0;
        if (this.maxAggregateMemoryInBytes <= 0) {
            throw new Error('maxAggregateMemoryInBytes must be greater than 0');
        }
        if (this.evictionMode !== exports.EvictionMode.LRU) {
            throw new Error("Unsupported eviction mode: ".concat(this.evictionMode));
        }
    }
    SimplestKeyValueStoreInMemImpl.prototype.put = function (key, value, ttlInSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            var entryMemory, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.store.has(key)) return [3, 2];
                        return [4, this.delete(key)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        entryMemory = this.estimateEntryMemory(key, value);
                        while (this.currentMemoryUsage + entryMemory > this.maxAggregateMemoryInBytes && this.store.size > 0) {
                            this.evictOldest();
                        }
                        if (entryMemory > this.maxAggregateMemoryInBytes) {
                            throw new Error("Entry size (".concat(entryMemory, " bytes) exceeds maxAggregateMemoryInBytes (").concat(this.maxAggregateMemoryInBytes, " bytes)"));
                        }
                        entry = {
                            value: value,
                            createdAt: Date.now(),
                            ttlInSeconds: ttlInSeconds
                        };
                        this.store.set(key, entry);
                        this.currentMemoryUsage += entryMemory;
                        return [2];
                }
            });
        });
    };
    SimplestKeyValueStoreInMemImpl.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, now, ageInSeconds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entry = this.store.get(key);
                        if (!entry) {
                            return [2, undefined];
                        }
                        now = Date.now();
                        ageInSeconds = Math.floor((now - entry.createdAt) / 1000);
                        if (!(entry.ttlInSeconds !== undefined && ageInSeconds >= entry.ttlInSeconds)) return [3, 2];
                        return [4, this.delete(key)];
                    case 1:
                        _a.sent();
                        return [2, undefined];
                    case 2:
                        this.store.delete(key);
                        this.store.set(key, entry);
                        return [2, {
                                value: entry.value,
                                ageInSeconds: ageInSeconds
                            }];
                }
            });
        });
    };
    SimplestKeyValueStoreInMemImpl.prototype.exists = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, now, ageInSeconds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entry = this.store.get(key);
                        if (!entry) {
                            return [2, false];
                        }
                        now = Date.now();
                        ageInSeconds = Math.floor((now - entry.createdAt) / 1000);
                        if (!(entry.ttlInSeconds !== undefined && ageInSeconds >= entry.ttlInSeconds)) return [3, 2];
                        return [4, this.delete(key)];
                    case 1:
                        _a.sent();
                        return [2, false];
                    case 2:
                        this.store.delete(key);
                        this.store.set(key, entry);
                        return [2, true];
                }
            });
        });
    };
    SimplestKeyValueStoreInMemImpl.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                entry = this.store.get(key);
                if (!entry) {
                    return [2, false];
                }
                this.store.delete(key);
                this.currentMemoryUsage -= this.estimateEntryMemory(key, entry.value);
                return [2, true];
            });
        });
    };
    SimplestKeyValueStoreInMemImpl.prototype.getCurrentMemoryUsage = function () {
        return this.currentMemoryUsage;
    };
    SimplestKeyValueStoreInMemImpl.prototype.getEntryCount = function () {
        return this.store.size;
    };
    SimplestKeyValueStoreInMemImpl.prototype.clear = function () {
        this.store.clear();
        this.currentMemoryUsage = 0;
    };
    SimplestKeyValueStoreInMemImpl.prototype.estimateEntryMemory = function (key, value) {
        var _a;
        var keyMemory = key.length * SimplestKeyValueStoreInMemImpl.BYTES_PER_CHAR;
        var valueMemory = (_a = value === null || value === void 0 ? void 0 : value.byteLength) !== null && _a !== void 0 ? _a : 0;
        var overhead = SimplestKeyValueStoreInMemImpl.ENTRY_OVERHEAD;
        return keyMemory + valueMemory + overhead;
    };
    SimplestKeyValueStoreInMemImpl.prototype.evictOldest = function () {
        var firstKey = this.store.keys().next().value;
        if (firstKey !== undefined) {
            this.delete(firstKey);
        }
    };
    SimplestKeyValueStoreInMemImpl.ENTRY_OVERHEAD = 100;
    SimplestKeyValueStoreInMemImpl.BYTES_PER_CHAR = 2;
    return SimplestKeyValueStoreInMemImpl;
}());
exports.SimplestKeyValueStoreInMemImpl = SimplestKeyValueStoreInMemImpl;
//# sourceMappingURL=SimplestKeyValueStoreInMemImpl.js.map