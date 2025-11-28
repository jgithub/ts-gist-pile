import { TerraformVariables } from './TerraformValue';

/**
 * The one thing this service contract does is convert Terraform variables
 * to .env file format.
 *
 * Handles:
 * - snake_case → SCREAMING_SNAKE_CASE transformation
 * - Complex types → JSON string serialization
 * - Comment generation with source tracking
 * - Proper escaping for shell consumption
 */
export interface TerraformToEnvConversionService {
  /**
   * generateEnvContent(): Convert Terraform variables to .env file content.
   *
   * Transformation rules:
   * - Variable names: snake_case → SCREAMING_SNAKE_CASE
   * - Strings: quoted if they contain spaces or special chars
   * - Numbers: converted to string
   * - Booleans: "true" or "false"
   * - Lists/Maps: JSON.stringify()
   *
   * @param variables - Terraform variables to convert
   * @param options - Generation options (comments, sorting, etc.)
   * @returns .env file content ready to write
   */
  generateEnvContent(
    variables: TerraformVariables,
    options?: TerraformToEnvConversionOptions
  ): string;

  /**
   * writeEnvFile(): Write Terraform variables to a .env file.
   *
   * @param filePath - Absolute path to output .env file
   * @param variables - Terraform variables to convert
   * @param options - Generation options
   */
  writeEnvFile(
    filePath: string,
    variables: TerraformVariables,
    options?: TerraformToEnvConversionOptions
  ): Promise<void>;
}

/**
 * Options for generating .env content.
 */
export interface TerraformToEnvConversionOptions {
  /**
   * includeComments: Add comments documenting source and transformations.
   * Default: true
   */
  includeComments?: boolean;

  /**
   * sortKeys: Sort variable names alphabetically.
   * Default: true
   */
  sortKeys?: boolean;

  /**
   * sourceLabel: Label to include in comments (e.g., "staging.tfvars").
   * Default: undefined (no source label)
   */
  sourceLabel?: string;

  /**
   * prefix: Add prefix to all variable names (e.g., "TF_").
   * Default: undefined (no prefix)
   */
  prefix?: string;
}
