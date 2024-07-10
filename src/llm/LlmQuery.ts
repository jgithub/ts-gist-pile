import { JsonValue } from "../json/JsonValue";
import { LlmQAndA } from "./LlmQAndA";

export interface LlmQuery {
  prompt: string
  additionalContext: JsonValue
  qAndA: Array<LlmQAndA>
}