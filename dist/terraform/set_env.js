#!/usr/bin/env npx tsx
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.parseDotenvContent = parseDotenvContent;
exports.parseArgs = parseArgs;
exports.runSetEnv = main;
var path = __importStar(require("path"));
var fs = __importStar(require("fs/promises"));
var TerraformParserServiceImpl_1 = require("./TerraformParserServiceImpl");
var TerraformToEnvConversionServiceImpl_1 = require("./TerraformToEnvConversionServiceImpl");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = parseArgs(process.argv.slice(2));
                    if (args.help) {
                        printHelp();
                        process.exit(0);
                    }
                    if (!(args.source === 'dotenv')) return [3, 2];
                    return [4, handleDotenvSource(args)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(args.source === 'tfvars')) return [3, 4];
                    return [4, handleTerraformSource(args)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2];
            }
        });
    });
}
function handleDotenvSource(args) {
    return __awaiter(this, void 0, void 0, function () {
        var environment, baseFile, baseFilePath, _a, baseContent, baseVars, localFilePath, localVars, hasLocal, localContent, _b, merged, lines, _i, _c, _d, key, value, envContent, outputPath, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    environment = args.environment || '';
                    baseFile = environment ? ".env.".concat(environment) : '.env';
                    baseFilePath = path.resolve(process.cwd(), baseFile);
                    console.log("Loading environment from: ".concat(baseFile));
                    console.log("Working directory: ".concat(process.cwd()));
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 15, , 16]);
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4, fs.access(baseFilePath)];
                case 3:
                    _e.sent();
                    return [3, 5];
                case 4:
                    _a = _e.sent();
                    console.error("\n\u274C ERROR: Environment file not found: ".concat(baseFile));
                    console.error("Searched in: ".concat(process.cwd()));
                    process.exit(1);
                    return [3, 5];
                case 5: return [4, fs.readFile(baseFilePath, 'utf-8')];
                case 6:
                    baseContent = _e.sent();
                    baseVars = parseDotenvContent(baseContent);
                    console.log("  \u2713 Loaded ".concat(Object.keys(baseVars).length, " variables from ").concat(baseFile));
                    localFilePath = path.resolve(process.cwd(), '.env.local');
                    localVars = {};
                    hasLocal = false;
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 10, , 11]);
                    return [4, fs.access(localFilePath)];
                case 8:
                    _e.sent();
                    hasLocal = true;
                    return [4, fs.readFile(localFilePath, 'utf-8')];
                case 9:
                    localContent = _e.sent();
                    localVars = parseDotenvContent(localContent);
                    console.log("  \u2713 Loaded ".concat(Object.keys(localVars).length, " variables from .env.local"));
                    return [3, 11];
                case 10:
                    _b = _e.sent();
                    console.log("  \u2139 No .env.local file found (this is fine)");
                    return [3, 11];
                case 11:
                    merged = __assign(__assign({}, baseVars), localVars);
                    console.log("  \u2713 Total: ".concat(Object.keys(merged).length, " variables"));
                    lines = [];
                    lines.push('# Environment variables');
                    lines.push("# Source: ".concat(baseFile).concat(hasLocal ? ' + .env.local' : ''));
                    lines.push("# Generated: ".concat(new Date().toISOString()));
                    lines.push('');
                    for (_i = 0, _c = Object.entries(merged).sort(function (_a, _b) {
                        var a = _a[0];
                        var b = _b[0];
                        return a.localeCompare(b);
                    }); _i < _c.length; _i++) {
                        _d = _c[_i], key = _d[0], value = _d[1];
                        lines.push("".concat(key, "=").concat(value));
                    }
                    envContent = lines.join('\n');
                    if (!args.output) return [3, 13];
                    outputPath = path.resolve(process.cwd(), args.output);
                    return [4, fs.writeFile(outputPath, envContent, 'utf-8')];
                case 12:
                    _e.sent();
                    console.log("\n\u2705 Generated: ".concat(outputPath));
                    return [3, 14];
                case 13:
                    console.log('\n' + '='.repeat(80));
                    console.log(envContent);
                    console.log('='.repeat(80));
                    _e.label = 14;
                case 14: return [3, 16];
                case 15:
                    error_1 = _e.sent();
                    console.error('\n❌ Error loading environment configuration:');
                    console.error(error_1 instanceof Error ? error_1.message : String(error_1));
                    process.exit(1);
                    return [3, 16];
                case 16: return [2];
            }
        });
    });
}
function parseDotenvContent(content) {
    var vars = {};
    var lines = content.split('\n');
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        line = line.trim();
        if (line.length === 0 || line.startsWith('#')) {
            continue;
        }
        var equalIndex = line.indexOf('=');
        if (equalIndex === -1) {
            continue;
        }
        var key = line.substring(0, equalIndex).trim();
        var value = line.substring(equalIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        }
        vars[key] = value;
    }
    return vars;
}
function handleTerraformSource(args) {
    return __awaiter(this, void 0, void 0, function () {
        var environment, infraDir, parser, terraformToEnvConversionService, commonPath, envPath, commonVars, envVars, merged, envContent, outputPath, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    environment = args.environment || 'development';
                    infraDir = args.path ? path.resolve(args.path) : process.cwd();
                    console.log("Loading Terraform variables for environment: ".concat(environment));
                    console.log("Working directory: ".concat(infraDir));
                    parser = new TerraformParserServiceImpl_1.TerraformParserServiceImpl();
                    terraformToEnvConversionService = new TerraformToEnvConversionServiceImpl_1.TerraformToEnvConversionServiceImpl();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    commonPath = path.join(infraDir, 'common.tfvars');
                    envPath = path.join(infraDir, "".concat(environment, ".tfvars"));
                    console.log("  Reading: ".concat(commonPath));
                    return [4, parser.parseFile(commonPath)];
                case 2:
                    commonVars = _a.sent();
                    console.log("  \u2713 Loaded ".concat(Object.keys(commonVars).length, " variables from common.tfvars"));
                    console.log("  Reading: ".concat(envPath));
                    return [4, parser.parseFile(envPath)];
                case 3:
                    envVars = _a.sent();
                    console.log("  \u2713 Loaded ".concat(Object.keys(envVars).length, " variables from ").concat(environment, ".tfvars"));
                    merged = parser.mergeVariables(commonVars, envVars);
                    console.log("  \u2713 Merged: ".concat(Object.keys(merged).length, " total variables"));
                    envContent = terraformToEnvConversionService.generateEnvContent(merged, {
                        includeComments: true,
                        sortKeys: true,
                        sourceLabel: "".concat(environment, ".tfvars")
                    });
                    if (!args.output) return [3, 5];
                    outputPath = path.resolve(process.cwd(), args.output);
                    return [4, fs.writeFile(outputPath, envContent, 'utf-8')];
                case 4:
                    _a.sent();
                    console.log("\n\u2705 Generated: ".concat(outputPath));
                    return [3, 6];
                case 5:
                    console.log('\n' + '='.repeat(80));
                    console.log(envContent);
                    console.log('='.repeat(80));
                    _a.label = 6;
                case 6: return [3, 8];
                case 7:
                    error_2 = _a.sent();
                    console.error('\n❌ Error loading Terraform configuration:');
                    console.error(error_2 instanceof Error ? error_2.message : String(error_2));
                    process.exit(1);
                    return [3, 8];
                case 8: return [2];
            }
        });
    });
}
function parseArgs(argv) {
    var args = {
        source: 'dotenv'
    };
    for (var _i = 0, argv_1 = argv; _i < argv_1.length; _i++) {
        var arg = argv_1[_i];
        if (arg === '--help' || arg === '-h') {
            args.help = true;
        }
        else if (arg.startsWith('--source=')) {
            var source = arg.substring('--source='.length);
            if (source !== 'dotenv' && source !== 'tfvars') {
                console.error("ERROR: Invalid --source value: ".concat(source));
                console.error('Valid values: dotenv, tfvars');
                process.exit(1);
            }
            args.source = source;
        }
        else if (arg.startsWith('--environment=')) {
            args.environment = arg.substring('--environment='.length);
        }
        else if (arg.startsWith('--output=')) {
            args.output = arg.substring('--output='.length);
        }
        else if (arg.startsWith('--path=')) {
            args.path = arg.substring('--path='.length);
        }
        else {
            console.error("ERROR: Unknown argument: ".concat(arg));
            printHelp();
            process.exit(1);
        }
    }
    return args;
}
function printHelp() {
    console.log("\nset_env.ts - Environment variable loader with multi-source support\n\nUSAGE:\n  npx tsx script/set_env.ts [options]\n\nOPTIONS:\n  --source=<type>         Source type: 'dotenv' or 'tfvars' (default: dotenv)\n  --environment=<name>    Environment name (e.g., development, staging, production)\n  --output=<file>         Output file path (default: stdout)\n  --path=<directory>      Directory to search for config files (default: current directory)\n  --help, -h              Show this help message\n\nEXAMPLES:\n  # Load from .env.development (and optionally .env.local) in current directory\n  npx tsx script/set_env.ts --source=dotenv --environment=development\n\n  # Load from .env in current directory\n  npx tsx script/set_env.ts --source=dotenv\n\n  # Load terraform files from specific directory\n  npx tsx script/set_env.ts --source=tfvars --environment=staging --path=./infrastructure\n\n  # Generate .env.staging from Terraform staging configuration in current directory\n  npx tsx script/set_env.ts --source=tfvars --environment=staging --output=.env.staging\n\n  # Load from test fixtures\n  cd test/terraform/fixtures && npx tsx ../../../script/set_env.ts --source=tfvars --environment=staging\n\nNOTE:\n  For --source=tfvars, this tool expects to find common.tfvars and <environment>.tfvars\n  in the working directory (or --path directory).\n\n  To set environment variables in your shell, use the wrapper script:\n    source script/set_env.sh --source=dotenv --environment=development\n");
}
var isMainModule = typeof require !== 'undefined' && require.main === module;
if (isMainModule) {
    main().catch(function (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=set_env.js.map