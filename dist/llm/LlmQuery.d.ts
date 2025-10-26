import { JsonObjectOrArray } from "../json/JsonObjectOrArray";
import { LlmQAndA } from "./LlmQAndA";
export interface LlmQuery {
    prompt: string;
    additionalContext: JsonObjectOrArray;
    qAndA: Array<LlmQAndA>;
}
