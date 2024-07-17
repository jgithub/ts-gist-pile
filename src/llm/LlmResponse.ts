import { JsonValue } from "../json/JsonValue";
import { LlmQAndA } from "./LlmQAndA";

export interface LlmResponse {
  rootResponseText?: string,
  rootResponseJson?: JsonValue,
  qAndA?: Array<LlmQAndA>
}