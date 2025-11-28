import { TerraformVariables } from './TerraformValue';
export interface TerraformParserService {
    parseFile(filePath: string): Promise<TerraformVariables>;
    parseString(content: string): TerraformVariables;
    mergeVariables(...variableSets: TerraformVariables[]): TerraformVariables;
}
