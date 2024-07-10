import { LlmAnswerMeta } from "./LlmAnswerMeta";

export interface LlmQAndA {
  // This is populated in the queyere
  question: string;

  // Additionally, these are populated in the response
  answer: string;
  answerMeta: LlmAnswerMeta;   
}