import { LlmQuery } from "./LlmQuery";
import { LlmQAndA } from "./LlmQAndA";
import { JsonObjectOrArray } from "../json/JsonObjectOrArray";
export declare class LlmQueryImpl implements LlmQuery {
    private readonly _attr;
    constructor(llmQuery: LlmQuery);
    addQuestion(questionText: string): void;
    get prompt(): string;
    set prompt(input: string);
    get additionalContext(): JsonObjectOrArray;
    set additionalContext(input: JsonObjectOrArray);
    get qAndA(): Array<LlmQAndA>;
    set qAndA(input: Array<LlmQAndA>);
}
