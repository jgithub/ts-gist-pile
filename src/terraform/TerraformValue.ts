/**
 * Represents a value that can appear in a Terraform .tfvars file.
 *
 * Terraform supports the following value types:
 * - string: "value"
 * - number: 42, 3.14
 * - boolean: true, false
 * - list: ["a", "b", "c"]
 * - map/object: { key = "value", nested = { inner = "value" } }
 */
export type TerraformValue =
  | string
  | number
  | boolean
  | TerraformValue[]
  | { [key: string]: TerraformValue };

/**
 * Represents a collection of Terraform variables parsed from a .tfvars file.
 * Keys are variable names (snake_case), values are their Terraform values.
 */
export interface TerraformVariables {
  [variableName: string]: TerraformValue;
}
