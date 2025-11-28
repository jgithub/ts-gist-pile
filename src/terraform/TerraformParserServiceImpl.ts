import { TerraformParserService } from './TerraformParserService';
import { TerraformValue, TerraformVariables } from './TerraformValue';
import { getLogger } from '../log/getLogger';
import { ProgrammerErrorException } from '../exception/ProgrammerErrorException';
import { cloneDeep } from '../clone/cloneUtil';
import * as fs from 'fs/promises';
const LOG = getLogger('terraform.TerraformParserServiceImpl');

/**
 * Implementation of TerraformParserService that parses .tfvars files.
 *
 * Uses a simple recursive descent parser to handle Terraform's HCL syntax.
 * Supports all basic value types but not complex HCL2 expressions.
 */
export class TerraformParserServiceImpl implements TerraformParserService {
  public async parseFile(filePath: string): Promise<TerraformVariables> {
    LOG.info(() => `parseFile(): Parsing file = ${filePath}`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      LOG.debug(() => `parseFile(): File read, length = ${content.length}`);
      const result = this.parseString(content);
      LOG.debug(() => `parseFile(): parseString complete, got ${Object.keys(result).length} keys`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      LOG.error(`parseFile(): Failed to read file = ${filePath}  errorMessage = ${errorMessage}`);
      throw new ProgrammerErrorException(
        `Failed to parse Terraform file: ${filePath}: ${errorMessage}`
      );
    }
  }

  public parseString(content: string): TerraformVariables {
    LOG.debug(() => `parseString(): Parsing content length = ${content.length}`);

    const variables: TerraformVariables = {};
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = this.stripComment(line).trim();

      // Skip empty lines
      if (trimmed.length === 0) {
        i++;
        continue;
      }

      // Parse variable assignment: name = value
      const assignmentMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
      if (assignmentMatch) {
        const varName = assignmentMatch[1]!;
        const valuePart = assignmentMatch[2]!;

        // Parse the value part (might be multi-line)
        const { value, nextLine } = this.parseValue(valuePart, lines, i);
        variables[varName] = value;
        i = nextLine;
      } else {
        // Not a valid assignment, skip
        LOG.warn(`parseString(): Skipping invalid line ${i + 1}: ${trimmed}`);
        i++;
      }
    }

    LOG.info(() => `parseString(): Parsed ${Object.keys(variables).length} variables`);
    return variables;
  }

  public mergeVariables(...variableSets: TerraformVariables[]): TerraformVariables {
    LOG.info(() => `mergeVariables(): Merging ${variableSets.length} variable sets`);

    if (variableSets.length === 0) {
      return {};
    }

    let result = cloneDeep(variableSets[0]!);

    for (let i = 1; i < variableSets.length; i++) {
      result = this.deepMerge(result, variableSets[i]!);
    }

    return result;
  }

  /**
   * stripComment(): Remove comments from a line.
   *
   * Handles:
   * - Line comments: # comment
   * - Inline comments: value = "foo" # comment
   *
   * Does NOT handle # inside strings (that's a limitation for simplicity).
   */
  private stripComment(line: string): string {
    const commentIndex = line.indexOf('#');
    if (commentIndex === -1) {
      return line;
    }

    // Simple heuristic: if # appears before any quotes, it's a comment
    // If # appears inside quotes, we should keep it, but for simplicity
    // we'll just strip from # onwards (user should avoid # in values)
    return line.substring(0, commentIndex);
  }

  /**
   * parseValue(): Parse a value starting from valuePart, possibly spanning multiple lines.
   *
   * @param valuePart - The part of the line after "="
   * @param lines - All lines of the file
   * @param currentLine - Current line index
   * @returns Parsed value and the next line index to process
   */
  private parseValue(
    valuePart: string,
    lines: string[],
    currentLine: number
  ): { value: TerraformValue; nextLine: number } {
    const trimmed = valuePart.trim();

    // String value
    if (trimmed.startsWith('"')) {
      const result = this.parseString_Value(trimmed);
      return { value: result.value, nextLine: currentLine + 1 };
    }

    // Boolean values
    if (trimmed === 'true') {
      return { value: true, nextLine: currentLine + 1 };
    }
    if (trimmed === 'false') {
      return { value: false, nextLine: currentLine + 1 };
    }

    // Number value
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      return { value: num, nextLine: currentLine + 1 };
    }

    // List value
    if (trimmed.startsWith('[')) {
      return this.parseList(trimmed, lines, currentLine);
    }

    // Map/object value
    if (trimmed.startsWith('{')) {
      return this.parseMap(trimmed, lines, currentLine);
    }

    // Unknown type - treat as string without quotes (less common but valid)
    LOG.warn(`parseValue(): Unknown value type, treating as string: ${trimmed}`);
    return { value: trimmed, nextLine: currentLine + 1 };
  }

  /**
   * parseString_Value(): Parse a quoted string value.
   */
  private parseString_Value(trimmed: string): { value: string; nextLine: number } {
    // Simple implementation: assume string is on one line
    // Multi-line strings would require more complex parsing
    const match = trimmed.match(/^"([^"]*)"$/);
    if (match) {
      return { value: match[1]!, nextLine: 0 }; // nextLine will be incremented by caller
    }

    // Malformed string
    throw new ProgrammerErrorException(`Malformed string value: ${trimmed}`);
  }

  /**
   * parseList(): Parse a list value, which may span multiple lines.
   */
  private parseList(
    valuePart: string,
    lines: string[],
    currentLine: number
  ): { value: TerraformValue[]; nextLine: number } {
    // Accumulate the full list content across lines
    let content = valuePart;
    let lineIdx = currentLine;

    // Find the closing bracket
    while (!this.hasClosingBracket(content, '[', ']') && lineIdx < lines.length - 1) {
      lineIdx++;
      content += ' ' + this.stripComment(lines[lineIdx]!).trim();
    }

    // Extract content between [ and ]
    const innerContent = this.extractBetweenBrackets(content, '[', ']');

    // Parse comma-separated values
    const items: TerraformValue[] = [];
    const parts = this.splitByComma(innerContent);

    for (const part of parts) {
      const trimmedPart = part.trim();
      if (trimmedPart.length === 0) continue;

      // Parse each item
      if (trimmedPart.startsWith('"')) {
        const match = trimmedPart.match(/^"([^"]*)"$/);
        if (match) {
          items.push(match[1]!);
        } else {
          throw new ProgrammerErrorException(`Malformed string in list: ${trimmedPart}`);
        }
      } else if (trimmedPart === 'true') {
        items.push(true);
      } else if (trimmedPart === 'false') {
        items.push(false);
      } else if (/^-?\d+(\.\d+)?$/.test(trimmedPart)) {
        items.push(parseFloat(trimmedPart));
      } else {
        // Nested structures would require recursive parsing
        throw new ProgrammerErrorException(`Unsupported value type in list: ${trimmedPart}`);
      }
    }

    return { value: items, nextLine: lineIdx + 1 };
  }

  /**
   * parseMap(): Parse a map/object value, which may span multiple lines.
   */
  private parseMap(
    valuePart: string,
    lines: string[],
    currentLine: number
  ): { value: { [key: string]: TerraformValue }; nextLine: number } {
    // Accumulate the full map content across lines
    let content = valuePart;
    let lineIdx = currentLine;

    // Find the closing brace
    while (!this.hasClosingBracket(content, '{', '}') && lineIdx < lines.length - 1) {
      lineIdx++;
      content += '\n' + this.stripComment(lines[lineIdx]!);
    }

    // Extract content between { and }
    const innerContent = this.extractBetweenBrackets(content, '{', '}');
    LOG.trace(() => `parseMap(): Map innerContent = "${innerContent.substring(0, 200)}..."`);

    // Parse key = value pairs
    const map: { [key: string]: TerraformValue } = {};

    // For nested maps, we need to process the content differently
    // We'll manually parse to handle multi-line nested structures
    let idx = 0;
    while (idx < innerContent.length) {
      // Skip whitespace and newlines
      while (idx < innerContent.length && /\s/.test(innerContent[idx]!)) {
        idx++;
      }

      if (idx >= innerContent.length) break;

      // Find key name
      const keyMatch = innerContent.substring(idx).match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
      if (!keyMatch) {
        // Skip to next line or break
        const nextNewline = innerContent.indexOf('\n', idx);
        if (nextNewline === -1) break;
        idx = nextNewline + 1;
        continue;
      }

      const key = keyMatch[1]!;
      idx += keyMatch[0].length;

      // Skip whitespace after =
      while (idx < innerContent.length && /[ \t]/.test(innerContent[idx]!)) {
        idx++;
      }

      if (idx >= innerContent.length) break;

      // Parse the value
      const char = innerContent[idx]!;

      if (char === '"') {
        // String value
        const endQuote = innerContent.indexOf('"', idx + 1);
        if (endQuote === -1) {
          throw new ProgrammerErrorException(`Unterminated string for key: ${key}`);
        }
        map[key] = innerContent.substring(idx + 1, endQuote);
        idx = endQuote + 1;

        // Skip comma if present after string
        while (idx < innerContent.length && /[ \t]/.test(innerContent[idx]!)) {
          idx++;
        }
        if (idx < innerContent.length && innerContent[idx] === ',') {
          idx++;
        }
      } else if (char === '{') {
        // Nested map - extract full content with balanced braces
        const startIdx = idx;
        let depth = 0;
        while (idx < innerContent.length) {
          if (innerContent[idx] === '{') depth++;
          if (innerContent[idx] === '}') depth--;
          idx++;
          if (depth === 0) break;
        }
        const nestedContent = innerContent.substring(startIdx, idx);
        const nestedResult = this.parseMap(nestedContent, [], 0);
        map[key] = nestedResult.value;
      } else if (innerContent.substring(idx, idx + 4) === 'true') {
        map[key] = true;
        idx += 4;
      } else if (innerContent.substring(idx, idx + 5) === 'false') {
        map[key] = false;
        idx += 5;
      } else {
        // Number or other value - read until newline, comma, or closing brace
        let endIdx = idx;
        while (endIdx < innerContent.length &&
               innerContent[endIdx] !== '\n' &&
               innerContent[endIdx] !== ',' &&
               innerContent[endIdx] !== '}') {
          endIdx++;
        }
        const valueStr = innerContent.substring(idx, endIdx).trim();
        if (/^-?\d+(\.\d+)?$/.test(valueStr)) {
          map[key] = parseFloat(valueStr);
        } else {
          throw new ProgrammerErrorException(`Unsupported value type for key ${key}: ${valueStr}`);
        }
        idx = endIdx;

        // Skip comma if present
        if (idx < innerContent.length && innerContent[idx] === ',') {
          idx++;
        }
      }
    }

    return { value: map, nextLine: lineIdx + 1 };
  }

  /**
   * hasClosingBracket(): Check if content has matching closing bracket.
   */
  private hasClosingBracket(content: string, open: string, close: string): boolean {
    let depth = 0;
    for (const char of content) {
      if (char === open) depth++;
      if (char === close) depth--;
    }
    return depth === 0;
  }

  /**
   * extractBetweenBrackets(): Extract content between opening and closing brackets.
   */
  private extractBetweenBrackets(content: string, open: string, close: string): string {
    const start = content.indexOf(open);
    const end = content.lastIndexOf(close);
    if (start === -1 || end === -1 || start >= end) {
      throw new ProgrammerErrorException(`Malformed brackets in: ${content}`);
    }
    return content.substring(start + 1, end);
  }

  /**
   * splitByComma(): Split content by commas, respecting quotes and nested structures.
   */
  private splitByComma(content: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let depth = 0;

    for (const char of content) {
      if (char === '"' && (current.length === 0 || current[current.length - 1] !== '\\')) {
        inQuotes = !inQuotes;
        current += char;
      } else if (!inQuotes) {
        if (char === '[' || char === '{') {
          depth++;
          current += char;
        } else if (char === ']' || char === '}') {
          depth--;
          current += char;
        } else if (char === ',' && depth === 0) {
          parts.push(current);
          current = '';
        } else {
          current += char;
        }
      } else {
        current += char;
      }
    }

    if (current.trim().length > 0) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * deepMerge(): Deep merge two objects, with right overriding left.
   */
  private deepMerge(left: TerraformVariables, right: TerraformVariables): TerraformVariables {
    const result = cloneDeep(left);

    for (const key in right) {
      if (Object.prototype.hasOwnProperty.call(right, key)) {
        const rightValue = right[key];
        const leftValue = result[key];

        // If both are plain objects, merge recursively
        if (
          this.isPlainObject(leftValue) &&
          this.isPlainObject(rightValue)
        ) {
          result[key] = this.deepMerge(
            leftValue as TerraformVariables,
            rightValue as TerraformVariables
          );
        } else {
          // Otherwise, right overrides left
          result[key] = cloneDeep(rightValue);
        }
      }
    }

    return result;
  }

  /**
   * isPlainObject(): Check if value is a plain object (not array, not null).
   */
  private isPlainObject(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    );
  }
}
