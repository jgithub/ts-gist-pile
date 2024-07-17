import { LlmQuery } from "./LlmQuery";
import { JsonValue } from "../json/JsonValue";
import { LlmQAndA } from "./LlmQAndA";
import { JsonObjectOrArray } from "../json/JsonObjectOrArray";

/**
 * Mutable Rich model associated with the anemic model 'LlmQuery'
 */

export class LlmQueryImpl implements LlmQuery {
  private readonly _attr: LlmQuery = {} as LlmQuery;

  constructor(llmQuery: LlmQuery) {
    this._attr = llmQuery || {}
  }

  public addQuestion(questionText: string): void {
    this._attr.qAndA = this._attr.qAndA || []
    this._attr.qAndA.push({question: questionText} as LlmQAndA)
  }

  public get prompt(): string {
    return this._attr.prompt;
  }

  public set prompt(input: string) {
    this._attr.prompt = input;
  }

  public get additionalContext(): JsonObjectOrArray {
    return this._attr.additionalContext;
  }

  public set additionalContext(input: JsonObjectOrArray) {
    this._attr.additionalContext = input;
  }

  public get qAndA(): Array<LlmQAndA> {
    return this._attr.qAndA;
  }

  public set qAndA(input: Array<LlmQAndA>) {
    this._attr.qAndA = input;
  }
}