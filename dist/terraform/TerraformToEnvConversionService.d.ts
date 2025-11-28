import { TerraformVariables } from './TerraformValue';
export interface TerraformToEnvConversionService {
    generateEnvContent(variables: TerraformVariables, options?: TerraformToEnvConversionOptions): string;
    writeEnvFile(filePath: string, variables: TerraformVariables, options?: TerraformToEnvConversionOptions): Promise<void>;
}
export interface TerraformToEnvConversionOptions {
    includeComments?: boolean;
    sortKeys?: boolean;
    sourceLabel?: string;
    prefix?: string;
}
