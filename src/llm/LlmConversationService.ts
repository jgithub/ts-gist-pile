import { LlmQuery } from "./LlmQuery";
import { LlmResponse } from "./LlmResponse";

export interface LlmConversationService {

  /**
   * 
   * 
   * @param llmQuery 
   */

  askQuery(llmQuery: LlmQuery): Promise<LlmResponse>
}