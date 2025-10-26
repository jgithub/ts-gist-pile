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
exports.DEFAULT_RETRY_OPTIONS = void 0;
exports.retryWithBackoff = retryWithBackoff;
exports.DEFAULT_RETRY_OPTIONS = {
    maxAttempts: 3,
    backoffMs: 100,
    backoffMultiplier: 2,
    jitter: 0.1,
};
function calculateDelay(attempt, backoffMs, backoffMultiplier, jitter, maxDelayMs) {
    var delay = backoffMs * Math.pow(backoffMultiplier, attempt - 1);
    if (maxDelayMs !== undefined) {
        delay = Math.min(delay, maxDelayMs);
    }
    if (jitter > 0) {
        var jitterAmount = delay * jitter * (Math.random() * 2 - 1);
        delay = delay + jitterAmount;
    }
    return Math.max(0, Math.floor(delay));
}
function retryWithBackoff(operation, options) {
    return __awaiter(this, void 0, void 0, function () {
        var maxAttempts, backoffMs, maxDelayMs, _a, backoffMultiplier, _b, jitter, shouldRetry, onRetry, onFailure, lastError, lastResult, _loop_1, attempt, state_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    maxAttempts = options.maxAttempts, backoffMs = options.backoffMs, maxDelayMs = options.maxDelayMs, _a = options.backoffMultiplier, backoffMultiplier = _a === void 0 ? exports.DEFAULT_RETRY_OPTIONS.backoffMultiplier : _a, _b = options.jitter, jitter = _b === void 0 ? exports.DEFAULT_RETRY_OPTIONS.jitter : _b, shouldRetry = options.shouldRetry, onRetry = options.onRetry, onFailure = options.onFailure;
                    _loop_1 = function (attempt) {
                        var result, shouldRetryResult, delayMs_1, error_1, shouldRetryError, delayMs_2;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 3, , 5]);
                                    return [4, operation()];
                                case 1:
                                    result = _d.sent();
                                    lastResult = result;
                                    lastError = undefined;
                                    shouldRetryResult = shouldRetry(undefined, result, attempt);
                                    if (!shouldRetryResult || attempt === maxAttempts) {
                                        return [2, { value: result }];
                                    }
                                    delayMs_1 = calculateDelay(attempt, backoffMs, backoffMultiplier, jitter, maxDelayMs);
                                    if (onRetry) {
                                        onRetry(undefined, result, attempt, delayMs_1);
                                    }
                                    return [4, new Promise(function (resolve) { return setTimeout(resolve, delayMs_1); })];
                                case 2:
                                    _d.sent();
                                    return [3, 5];
                                case 3:
                                    error_1 = _d.sent();
                                    lastError = error_1;
                                    lastResult = undefined;
                                    shouldRetryError = shouldRetry(error_1, undefined, attempt);
                                    if (!shouldRetryError || attempt === maxAttempts) {
                                        if (onFailure && attempt === maxAttempts) {
                                            onFailure(error_1, undefined, attempt);
                                        }
                                        throw error_1;
                                    }
                                    delayMs_2 = calculateDelay(attempt, backoffMs, backoffMultiplier, jitter, maxDelayMs);
                                    if (onRetry) {
                                        onRetry(error_1, undefined, attempt, delayMs_2);
                                    }
                                    return [4, new Promise(function (resolve) { return setTimeout(resolve, delayMs_2); })];
                                case 4:
                                    _d.sent();
                                    return [3, 5];
                                case 5: return [2];
                            }
                        });
                    };
                    attempt = 1;
                    _c.label = 1;
                case 1:
                    if (!(attempt <= maxAttempts)) return [3, 4];
                    return [5, _loop_1(attempt)];
                case 2:
                    state_1 = _c.sent();
                    if (typeof state_1 === "object")
                        return [2, state_1.value];
                    _c.label = 3;
                case 3:
                    attempt++;
                    return [3, 1];
                case 4:
                    if (onFailure) {
                        onFailure(lastError, lastResult, maxAttempts);
                    }
                    if (lastError !== undefined) {
                        throw lastError;
                    }
                    return [2, lastResult];
            }
        });
    });
}
//# sourceMappingURL=retryUtil.js.map