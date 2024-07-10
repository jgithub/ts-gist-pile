import { JsonValue } from "../json/JsonValue";
import { LlmQAndA } from "./LlmQAndA";

export interface LlmResponse {
  qAndA: Array<LlmQAndA>
}