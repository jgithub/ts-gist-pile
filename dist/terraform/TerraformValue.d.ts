export type TerraformValue = string | number | boolean | TerraformValue[] | {
    [key: string]: TerraformValue;
};
export interface TerraformVariables {
    [variableName: string]: TerraformValue;
}
