import { LlmQuery } from "./LlmQuery";
import { LlmResponse } from "./LlmResponse";
export interface LlmConversationService {
    askQuery(llmQuery: LlmQuery): Promise<LlmResponse>;
}
