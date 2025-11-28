import { TerraformToEnvConversionService, TerraformToEnvConversionOptions } from './TerraformToEnvConversionService';
import { TerraformVariables } from './TerraformValue';
export declare class TerraformToEnvConversionServiceImpl implements TerraformToEnvConversionService {
    generateEnvContent(variables: TerraformVariables, options?: TerraformToEnvConversionOptions): string;
    writeEnvFile(filePath: string, variables: TerraformVariables, options?: TerraformToEnvConversionOptions): Promise<void>;
    private toEnvVarName;
    private toEnvVarValue;
    private quoteIfNeeded;
}
