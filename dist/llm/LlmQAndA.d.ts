import { LlmAnswerMeta } from "./LlmAnswerMeta";
export interface LlmQAndA {
    question: string;
    answer: string;
    answerMeta: LlmAnswerMeta;
}
