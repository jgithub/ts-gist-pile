import { TerraformParserService } from './TerraformParserService';
import { TerraformVariables } from './TerraformValue';
export declare class TerraformParserServiceImpl implements TerraformParserService {
    parseFile(filePath: string): Promise<TerraformVariables>;
    parseString(content: string): TerraformVariables;
    mergeVariables(...variableSets: TerraformVariables[]): TerraformVariables;
    private stripComment;
    private parseValue;
    private parseString_Value;
    private parseList;
    private parseMap;
    private hasClosingBracket;
    private extractBetweenBrackets;
    private splitByComma;
    private deepMerge;
    private isPlainObject;
}
