"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetEnvVarCache = resetEnvVarCache;
exports.tryGetEnvVar = tryGetEnvVar;
exports.isProductionLikeEnv = isProductionLikeEnv;
exports.isDevelopmentLikeEnv = isDevelopmentLikeEnv;
exports.isStagingLikeEnv = isStagingLikeEnv;
var memoized = new Map();
function resetEnvVarCache() {
    memoized.clear();
}
function tryGetEnvVar(envVarName) {
    var _a, _b;
    var retval = undefined;
    if (typeof retval === 'undefined') {
        if (typeof process !== 'undefined' && typeof ((_a = process.env) === null || _a === void 0 ? void 0 : _a[envVarName]) !== 'undefined') {
            retval = process.env[envVarName];
            if (!memoized.has("process.env.".concat(envVarName))) {
                console.log("ts-gist-pile: tryGetEnvVar(): During logger configuration, found process.env[".concat(envVarName, "] = ").concat(retval));
                memoized.set("process.env.".concat(envVarName), true);
            }
        }
    }
    var prefixes = ["REACT_APP_", "VITE_"];
    for (var ii = 0; ii < prefixes.length; ++ii) {
        var prefix = prefixes[ii];
        if (typeof retval === 'undefined') {
            var effectiveEnvVarName = "".concat(prefix).concat(envVarName);
            if (typeof process !== 'undefined' && typeof ((_b = process.env) === null || _b === void 0 ? void 0 : _b[effectiveEnvVarName]) !== 'undefined') {
                retval = process.env[effectiveEnvVarName];
                if (!memoized.has("process.env.".concat(effectiveEnvVarName))) {
                    console.log("ts-gist-pile: tryGetEnvVar(): During logger configuration, found process.env[".concat(effectiveEnvVarName, "] = ").concat(retval));
                    memoized.set("process.env.".concat(effectiveEnvVarName), true);
                }
            }
        }
    }
    return retval;
}
function isProductionLikeEnv() {
    var nodeEnv = tryGetEnvVar('NODE_ENV');
    return nodeEnv === 'production' || nodeEnv === 'prod';
}
function isDevelopmentLikeEnv() {
    var nodeEnv = tryGetEnvVar('NODE_ENV');
    return nodeEnv === 'development' || nodeEnv === 'dev';
}
function isStagingLikeEnv() {
    var nodeEnv = tryGetEnvVar('NODE_ENV');
    return nodeEnv === 'staging' || nodeEnv === 'stage';
}
//# sourceMappingURL=envUtil.js.map