import { TerraformToEnvConversionService, TerraformToEnvConversionOptions } from './TerraformToEnvConversionService';
import { TerraformValue, TerraformVariables } from './TerraformValue';
import { getLogger } from '../log/getLogger';
import * as fs from 'fs/promises';

const LOG = getLogger('terraform.TerraformToEnvConversionServiceImpl');

/**
 * Implementation of TerraformToEnvConversionService that converts Terraform variables
 * to .env file format.
 */
export class TerraformToEnvConversionServiceImpl implements TerraformToEnvConversionService {
  public generateEnvContent(
    variables: TerraformVariables,
    options?: TerraformToEnvConversionOptions
  ): string {
    LOG.info(() => `generateEnvContent(): Generating .env content for ${Object.keys(variables).length} variables`);

    const opts = {
      includeComments: options?.includeComments ?? true,
      sortKeys: options?.sortKeys ?? true,
      sourceLabel: options?.sourceLabel,
      prefix: options?.prefix ?? ''
    };

    const lines: string[] = [];

    // Add header comment
    if (opts.includeComments) {
      lines.push('# Environment variables generated from Terraform configuration');
      if (opts.sourceLabel) {
        lines.push(`# Source: ${opts.sourceLabel}`);
      }
      lines.push(`# Generated: ${new Date().toISOString()}`);
      lines.push('');
    }

    // Get sorted keys
    const keys = Object.keys(variables);
    if (opts.sortKeys) {
      keys.sort();
    }

    // Convert each variable
    for (const key of keys) {
      const value = variables[key]!;
      const envKey = this.toEnvVarName(key, opts.prefix);
      const envValue = this.toEnvVarValue(value);

      lines.push(`${envKey}=${envValue}`);
    }

    return lines.join('\n') + (lines.length > 0 ? '\n' : '');
  }

  public async writeEnvFile(
    filePath: string,
    variables: TerraformVariables,
    options?: TerraformToEnvConversionOptions
  ): Promise<void> {
    LOG.info(() => `writeEnvFile(): Writing .env file to ${filePath}`);

    const content = this.generateEnvContent(variables, options);
    await fs.writeFile(filePath, content, 'utf-8');

    LOG.info(() => `writeEnvFile(): Successfully wrote ${filePath}`);
  }

  /**
   * toEnvVarName(): Convert snake_case to SCREAMING_SNAKE_CASE with optional prefix.
   */
  private toEnvVarName(terraformName: string, prefix: string): string {
    const screamingCase = terraformName.toUpperCase();
    return prefix + screamingCase;
  }

  /**
   * toEnvVarValue(): Convert Terraform value to .env format.
   *
   * Rules:
   * - Strings: quote if contains spaces or special chars
   * - Numbers: convert to string
   * - Booleans: "true" or "false"
   * - Arrays/Objects: JSON.stringify()
   */
  private toEnvVarValue(value: TerraformValue): string {
    // String
    if (typeof value === 'string') {
      return this.quoteIfNeeded(value);
    }

    // Number
    if (typeof value === 'number') {
      return String(value);
    }

    // Boolean
    if (typeof value === 'boolean') {
      return String(value);
    }

    // Array or Object
    return JSON.stringify(value);
  }

  /**
   * quoteIfNeeded(): Quote string if it contains spaces or special characters.
   */
  private quoteIfNeeded(value: string): string {
    // Check if value needs quoting
    const needsQuotes = /[\s@$!*?/\\]/.test(value);

    if (needsQuotes) {
      // Escape any existing quotes
      const escaped = value.replace(/"/g, '\\"');
      return `"${escaped}"`;
    }

    return value;
  }
}
