import { JsonObjectOrArray } from "../json/JsonObjectOrArray";
import { JsonValue } from "../json/JsonValue";
import { LlmQAndA } from "./LlmQAndA";

export interface LlmResponse {
  rootResponseText?: string,
  rootResponseJson?: JsonObjectOrArray,
  qAndA?: Array<LlmQAndA>
}