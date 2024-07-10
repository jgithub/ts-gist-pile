import { JsonValue } from "../json/JsonValue";
import { LlmQAndA } from "./LlmQAndA";

export interface LlmResponse {
  rootResponseText?: string
  qAndA?: Array<LlmQAndA>
}