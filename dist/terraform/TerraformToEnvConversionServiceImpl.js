"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.TerraformToEnvConversionServiceImpl = void 0;
var getLogger_1 = require("../log/getLogger");
var fs = __importStar(require("fs/promises"));
var LOG = (0, getLogger_1.getLogger)('terraform.TerraformToEnvConversionServiceImpl');
var TerraformToEnvConversionServiceImpl = (function () {
    function TerraformToEnvConversionServiceImpl() {
    }
    TerraformToEnvConversionServiceImpl.prototype.generateEnvContent = function (variables, options) {
        var _a, _b, _c;
        LOG.info(function () { return "generateEnvContent(): Generating .env content for ".concat(Object.keys(variables).length, " variables"); });
        var opts = {
            includeComments: (_a = options === null || options === void 0 ? void 0 : options.includeComments) !== null && _a !== void 0 ? _a : true,
            sortKeys: (_b = options === null || options === void 0 ? void 0 : options.sortKeys) !== null && _b !== void 0 ? _b : true,
            sourceLabel: options === null || options === void 0 ? void 0 : options.sourceLabel,
            prefix: (_c = options === null || options === void 0 ? void 0 : options.prefix) !== null && _c !== void 0 ? _c : ''
        };
        var lines = [];
        if (opts.includeComments) {
            lines.push('# Environment variables generated from Terraform configuration');
            if (opts.sourceLabel) {
                lines.push("# Source: ".concat(opts.sourceLabel));
            }
            lines.push("# Generated: ".concat(new Date().toISOString()));
            lines.push('');
        }
        var keys = Object.keys(variables);
        if (opts.sortKeys) {
            keys.sort();
        }
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var value = variables[key];
            var envKey = this.toEnvVarName(key, opts.prefix);
            var envValue = this.toEnvVarValue(value);
            lines.push("".concat(envKey, "=").concat(envValue));
        }
        return lines.join('\n') + (lines.length > 0 ? '\n' : '');
    };
    TerraformToEnvConversionServiceImpl.prototype.writeEnvFile = function (filePath, variables, options) {
        return __awaiter(this, void 0, void 0, function () {
            var content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LOG.info(function () { return "writeEnvFile(): Writing .env file to ".concat(filePath); });
                        content = this.generateEnvContent(variables, options);
                        return [4, fs.writeFile(filePath, content, 'utf-8')];
                    case 1:
                        _a.sent();
                        LOG.info(function () { return "writeEnvFile(): Successfully wrote ".concat(filePath); });
                        return [2];
                }
            });
        });
    };
    TerraformToEnvConversionServiceImpl.prototype.toEnvVarName = function (terraformName, prefix) {
        var screamingCase = terraformName.toUpperCase();
        return prefix + screamingCase;
    };
    TerraformToEnvConversionServiceImpl.prototype.toEnvVarValue = function (value) {
        if (typeof value === 'string') {
            return this.quoteIfNeeded(value);
        }
        if (typeof value === 'number') {
            return String(value);
        }
        if (typeof value === 'boolean') {
            return String(value);
        }
        return JSON.stringify(value);
    };
    TerraformToEnvConversionServiceImpl.prototype.quoteIfNeeded = function (value) {
        var needsQuotes = /[\s@$!*?/\\]/.test(value);
        if (needsQuotes) {
            var escaped = value.replace(/"/g, '\\"');
            return "\"".concat(escaped, "\"");
        }
        return value;
    };
    return TerraformToEnvConversionServiceImpl;
}());
exports.TerraformToEnvConversionServiceImpl = TerraformToEnvConversionServiceImpl;
//# sourceMappingURL=TerraformToEnvConversionServiceImpl.js.map