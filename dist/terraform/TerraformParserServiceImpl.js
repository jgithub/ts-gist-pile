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
exports.TerraformParserServiceImpl = void 0;
var getLogger_1 = require("../log/getLogger");
var ProgrammerErrorException_1 = require("../exception/ProgrammerErrorException");
var cloneUtil_1 = require("../clone/cloneUtil");
var fs = __importStar(require("fs/promises"));
var LOG = (0, getLogger_1.getLogger)('terraform.TerraformParserServiceImpl');
var TerraformParserServiceImpl = (function () {
    function TerraformParserServiceImpl() {
    }
    TerraformParserServiceImpl.prototype.parseFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var content_1, result_1, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LOG.info(function () { return "parseFile(): Parsing file = ".concat(filePath); });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, fs.readFile(filePath, 'utf-8')];
                    case 2:
                        content_1 = _a.sent();
                        LOG.debug(function () { return "parseFile(): File read, length = ".concat(content_1.length); });
                        result_1 = this.parseString(content_1);
                        LOG.debug(function () { return "parseFile(): parseString complete, got ".concat(Object.keys(result_1).length, " keys"); });
                        return [2, result_1];
                    case 3:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        LOG.error("parseFile(): Failed to read file = ".concat(filePath, "  errorMessage = ").concat(errorMessage));
                        throw new ProgrammerErrorException_1.ProgrammerErrorException("Failed to parse Terraform file: ".concat(filePath, ": ").concat(errorMessage));
                    case 4: return [2];
                }
            });
        });
    };
    TerraformParserServiceImpl.prototype.parseString = function (content) {
        LOG.debug(function () { return "parseString(): Parsing content length = ".concat(content.length); });
        var variables = {};
        var lines = content.split('\n');
        var i = 0;
        while (i < lines.length) {
            var line = lines[i];
            var trimmed = this.stripComment(line).trim();
            if (trimmed.length === 0) {
                i++;
                continue;
            }
            var assignmentMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
            if (assignmentMatch) {
                var varName = assignmentMatch[1];
                var valuePart = assignmentMatch[2];
                var _a = this.parseValue(valuePart, lines, i), value = _a.value, nextLine = _a.nextLine;
                variables[varName] = value;
                i = nextLine;
            }
            else {
                LOG.warn("parseString(): Skipping invalid line ".concat(i + 1, ": ").concat(trimmed));
                i++;
            }
        }
        LOG.info(function () { return "parseString(): Parsed ".concat(Object.keys(variables).length, " variables"); });
        return variables;
    };
    TerraformParserServiceImpl.prototype.mergeVariables = function () {
        var variableSets = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            variableSets[_i] = arguments[_i];
        }
        LOG.info(function () { return "mergeVariables(): Merging ".concat(variableSets.length, " variable sets"); });
        if (variableSets.length === 0) {
            return {};
        }
        var result = (0, cloneUtil_1.cloneDeep)(variableSets[0]);
        for (var i = 1; i < variableSets.length; i++) {
            result = this.deepMerge(result, variableSets[i]);
        }
        return result;
    };
    TerraformParserServiceImpl.prototype.stripComment = function (line) {
        var commentIndex = line.indexOf('#');
        if (commentIndex === -1) {
            return line;
        }
        return line.substring(0, commentIndex);
    };
    TerraformParserServiceImpl.prototype.parseValue = function (valuePart, lines, currentLine) {
        var trimmed = valuePart.trim();
        if (trimmed.startsWith('"')) {
            var result = this.parseString_Value(trimmed);
            return { value: result.value, nextLine: currentLine + 1 };
        }
        if (trimmed === 'true') {
            return { value: true, nextLine: currentLine + 1 };
        }
        if (trimmed === 'false') {
            return { value: false, nextLine: currentLine + 1 };
        }
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            var num = parseFloat(trimmed);
            return { value: num, nextLine: currentLine + 1 };
        }
        if (trimmed.startsWith('[')) {
            return this.parseList(trimmed, lines, currentLine);
        }
        if (trimmed.startsWith('{')) {
            return this.parseMap(trimmed, lines, currentLine);
        }
        LOG.warn("parseValue(): Unknown value type, treating as string: ".concat(trimmed));
        return { value: trimmed, nextLine: currentLine + 1 };
    };
    TerraformParserServiceImpl.prototype.parseString_Value = function (trimmed) {
        var match = trimmed.match(/^"([^"]*)"$/);
        if (match) {
            return { value: match[1], nextLine: 0 };
        }
        throw new ProgrammerErrorException_1.ProgrammerErrorException("Malformed string value: ".concat(trimmed));
    };
    TerraformParserServiceImpl.prototype.parseList = function (valuePart, lines, currentLine) {
        var content = valuePart;
        var lineIdx = currentLine;
        while (!this.hasClosingBracket(content, '[', ']') && lineIdx < lines.length - 1) {
            lineIdx++;
            content += ' ' + this.stripComment(lines[lineIdx]).trim();
        }
        var innerContent = this.extractBetweenBrackets(content, '[', ']');
        var items = [];
        var parts = this.splitByComma(innerContent);
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            var trimmedPart = part.trim();
            if (trimmedPart.length === 0)
                continue;
            if (trimmedPart.startsWith('"')) {
                var match = trimmedPart.match(/^"([^"]*)"$/);
                if (match) {
                    items.push(match[1]);
                }
                else {
                    throw new ProgrammerErrorException_1.ProgrammerErrorException("Malformed string in list: ".concat(trimmedPart));
                }
            }
            else if (trimmedPart === 'true') {
                items.push(true);
            }
            else if (trimmedPart === 'false') {
                items.push(false);
            }
            else if (/^-?\d+(\.\d+)?$/.test(trimmedPart)) {
                items.push(parseFloat(trimmedPart));
            }
            else {
                throw new ProgrammerErrorException_1.ProgrammerErrorException("Unsupported value type in list: ".concat(trimmedPart));
            }
        }
        return { value: items, nextLine: lineIdx + 1 };
    };
    TerraformParserServiceImpl.prototype.parseMap = function (valuePart, lines, currentLine) {
        var content = valuePart;
        var lineIdx = currentLine;
        while (!this.hasClosingBracket(content, '{', '}') && lineIdx < lines.length - 1) {
            lineIdx++;
            content += '\n' + this.stripComment(lines[lineIdx]);
        }
        var innerContent = this.extractBetweenBrackets(content, '{', '}');
        LOG.trace(function () { return "parseMap(): Map innerContent = \"".concat(innerContent.substring(0, 200), "...\""); });
        var map = {};
        var idx = 0;
        while (idx < innerContent.length) {
            while (idx < innerContent.length && /\s/.test(innerContent[idx])) {
                idx++;
            }
            if (idx >= innerContent.length)
                break;
            var keyMatch = innerContent.substring(idx).match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
            if (!keyMatch) {
                var nextNewline = innerContent.indexOf('\n', idx);
                if (nextNewline === -1)
                    break;
                idx = nextNewline + 1;
                continue;
            }
            var key = keyMatch[1];
            idx += keyMatch[0].length;
            while (idx < innerContent.length && /[ \t]/.test(innerContent[idx])) {
                idx++;
            }
            if (idx >= innerContent.length)
                break;
            var char = innerContent[idx];
            if (char === '"') {
                var endQuote = innerContent.indexOf('"', idx + 1);
                if (endQuote === -1) {
                    throw new ProgrammerErrorException_1.ProgrammerErrorException("Unterminated string for key: ".concat(key));
                }
                map[key] = innerContent.substring(idx + 1, endQuote);
                idx = endQuote + 1;
                while (idx < innerContent.length && /[ \t]/.test(innerContent[idx])) {
                    idx++;
                }
                if (idx < innerContent.length && innerContent[idx] === ',') {
                    idx++;
                }
            }
            else if (char === '{') {
                var startIdx = idx;
                var depth = 0;
                while (idx < innerContent.length) {
                    if (innerContent[idx] === '{')
                        depth++;
                    if (innerContent[idx] === '}')
                        depth--;
                    idx++;
                    if (depth === 0)
                        break;
                }
                var nestedContent = innerContent.substring(startIdx, idx);
                var nestedResult = this.parseMap(nestedContent, [], 0);
                map[key] = nestedResult.value;
            }
            else if (innerContent.substring(idx, idx + 4) === 'true') {
                map[key] = true;
                idx += 4;
            }
            else if (innerContent.substring(idx, idx + 5) === 'false') {
                map[key] = false;
                idx += 5;
            }
            else {
                var endIdx = idx;
                while (endIdx < innerContent.length &&
                    innerContent[endIdx] !== '\n' &&
                    innerContent[endIdx] !== ',' &&
                    innerContent[endIdx] !== '}') {
                    endIdx++;
                }
                var valueStr = innerContent.substring(idx, endIdx).trim();
                if (/^-?\d+(\.\d+)?$/.test(valueStr)) {
                    map[key] = parseFloat(valueStr);
                }
                else {
                    throw new ProgrammerErrorException_1.ProgrammerErrorException("Unsupported value type for key ".concat(key, ": ").concat(valueStr));
                }
                idx = endIdx;
                if (idx < innerContent.length && innerContent[idx] === ',') {
                    idx++;
                }
            }
        }
        return { value: map, nextLine: lineIdx + 1 };
    };
    TerraformParserServiceImpl.prototype.hasClosingBracket = function (content, open, close) {
        var depth = 0;
        for (var _i = 0, content_2 = content; _i < content_2.length; _i++) {
            var char = content_2[_i];
            if (char === open)
                depth++;
            if (char === close)
                depth--;
        }
        return depth === 0;
    };
    TerraformParserServiceImpl.prototype.extractBetweenBrackets = function (content, open, close) {
        var start = content.indexOf(open);
        var end = content.lastIndexOf(close);
        if (start === -1 || end === -1 || start >= end) {
            throw new ProgrammerErrorException_1.ProgrammerErrorException("Malformed brackets in: ".concat(content));
        }
        return content.substring(start + 1, end);
    };
    TerraformParserServiceImpl.prototype.splitByComma = function (content) {
        var parts = [];
        var current = '';
        var inQuotes = false;
        var depth = 0;
        for (var _i = 0, content_3 = content; _i < content_3.length; _i++) {
            var char = content_3[_i];
            if (char === '"' && (current.length === 0 || current[current.length - 1] !== '\\')) {
                inQuotes = !inQuotes;
                current += char;
            }
            else if (!inQuotes) {
                if (char === '[' || char === '{') {
                    depth++;
                    current += char;
                }
                else if (char === ']' || char === '}') {
                    depth--;
                    current += char;
                }
                else if (char === ',' && depth === 0) {
                    parts.push(current);
                    current = '';
                }
                else {
                    current += char;
                }
            }
            else {
                current += char;
            }
        }
        if (current.trim().length > 0) {
            parts.push(current);
        }
        return parts;
    };
    TerraformParserServiceImpl.prototype.deepMerge = function (left, right) {
        var result = (0, cloneUtil_1.cloneDeep)(left);
        for (var key in right) {
            if (Object.prototype.hasOwnProperty.call(right, key)) {
                var rightValue = right[key];
                var leftValue = result[key];
                if (this.isPlainObject(leftValue) &&
                    this.isPlainObject(rightValue)) {
                    result[key] = this.deepMerge(leftValue, rightValue);
                }
                else {
                    result[key] = (0, cloneUtil_1.cloneDeep)(rightValue);
                }
            }
        }
        return result;
    };
    TerraformParserServiceImpl.prototype.isPlainObject = function (value) {
        return (typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value));
    };
    return TerraformParserServiceImpl;
}());
exports.TerraformParserServiceImpl = TerraformParserServiceImpl;
//# sourceMappingURL=TerraformParserServiceImpl.js.map