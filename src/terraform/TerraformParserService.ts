import { TerraformVariables } from './TerraformValue';

/**
 * The one thing this service contract does is parse Terraform .tfvars files
 * into structured TypeScript data.
 *
 * This service handles:
 * - Parsing .tfvars syntax (key = value pairs)
 * - Comments (# single-line)
 * - All Terraform value types (string, number, boolean, list, map)
 * - Multi-line strings and nested structures
 *
 * Does NOT handle:
 * - HCL2 expressions (functions, interpolations)
 * - Variable definitions (only assignments)
 * - Terraform modules or resources
 * - Type validation
 */
export interface TerraformParserService {
  /**
   * parseFile(): Parse a single .tfvars file into variables.
   *
   * @param filePath - Absolute path to .tfvars file
   * @returns Parsed variables as key-value pairs
   * @throws ProgrammerErrorException if file doesn't exist or is malformed
   */
  parseFile(filePath: string): Promise<TerraformVariables>;

  /**
   * parseString(): Parse .tfvars content from a string.
   *
   * @param content - Raw .tfvars content
   * @returns Parsed variables as key-value pairs
   * @throws ProgrammerErrorException if content is malformed
   */
  parseString(content: string): TerraformVariables;

  /**
   * mergeVariables(): Merge multiple variable sets with later ones overriding earlier.
   *
   * This implements the Terraform layering pattern:
   *   common.tfvars → environment.tfvars → overrides.tfvars
   *
   * @param variableSets - Array of variable sets to merge (left to right)
   * @returns Merged variables with later values overriding earlier
   */
  mergeVariables(...variableSets: TerraformVariables[]): TerraformVariables;
}
