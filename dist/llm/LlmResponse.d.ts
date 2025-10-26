import { JsonObjectOrArray } from "../json/JsonObjectOrArray";
import { LlmQAndA } from "./LlmQAndA";
export interface LlmResponse {
    rootResponseText?: string;
    rootResponseJson?: JsonObjectOrArray;
    qAndA?: Array<LlmQAndA>;
}
