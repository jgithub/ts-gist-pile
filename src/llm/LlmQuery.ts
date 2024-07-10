import { JsonValue } from "../json/JsonValue";
import { LlmQAndA } from "./LlmQAndA";

export interface LlmQuery {
  prompt: string,
  context: JsonValue
  qAndA: Array<LlmQAndA>
}