// Browser-safe subset of ts-gist-pile
// Excludes Node-only modules: terraform/* (fs/promises), env/set_env (fs/promises), TraceInitializer

// Namespace utility exports
export * as anyUtil from "./any/anyUtil"
export * as objectUtil from "./object/objectUtil"
export * as cloneUtil from "./clone/cloneUtil"
export * as stringUtil from "./string/stringUtil"
export * as booleanUtil from "./boolean/booleanUtil"
export * as logUtil from "./log/logUtil"
export * as numberUtil from "./number/numberUtil"
export * as dateUtil from "./date/dateUtil"
export * as mapUtil from "./map/mapUtil"
export * as functionUtil from "./function/functionUtil"
export * as extendedExceptionList from "./exception/extendedExceptionList"
export * as arrayUtil from "./array/arrayUtil"
export * as tryUtil from "./try/tryUtil"
export * as radixUtil from "./radix/radixUtil"
export * as uuidUtil from "./uuid/uuidUtil"
export * as idUtil from "./id/idUtil"
export * as emailUtil from "./email/emailUtil"
export * as phoneUtil from "./phone/phoneUtil"
export * as diceUtil from "./dice/diceUtil"
export * as shortcodeUtil from "./shortcode/shortcodeUtil"
export * as requestUtil from "./request/requestUtil"
export * as retryUtil from "./retry/retryUtil"
export * as environmentUtil from "./env/environmentUtil"
export * as statUtil from "./stat/statUtil"
export * as jsonUtil from "./json/jsonUtil"

// Named exports
export { Container } from "./di/Container"
export { getLogger, LOG_RULES, withStoreId } from "./log/getLogger"
export { d4l, d4lObfuscate, d4lPii, plain, blur, blurIfEnabled, blurWhereNeeded, p4l, b4l, c4l, s4l } from "./log/logUtil"
export { safeStringify } from "./string/safeStringify"
export { BooleanStringPair } from "./container/BooleanStringPair"
export { ResultOrErr } from "./result/ResultOrErr"
export { ResultTuple } from "./result/ResultTuple"
export { JsonApiError, DomainError } from "./error/JsonApiError"
export { CollectionWithMeta } from "./collection/CollectionWithMeta"
export { OptionallyCachedValue } from "./container/OptionallyCachedValue"
export { ObjectIdFinder } from "./object/ObjectIdFinder"
export { JsonValue } from "./json/JsonValue"
export { DateProviderServiceImpl } from "./date/DateProviderServiceImpl"
export { DateProviderService } from "./date/DateProviderService"
export { UtcGetterService } from "./date/UtcGetterService"
export { UtcGetterServiceImpl } from "./date/UtcGetterServiceImpl"
export { ImmutableUtc } from "./date/ImmutableUtc"
export { CanonicalUuid } from "./uuid/CanonicalUuid"
export { SimplestKeyValueStoreInMemImpl, EvictionMode } from "./keyvalue/SimplestKeyValueStoreInMemImpl"
export { CsvDataExtractor } from "./csv/CsvDataExtractor"
export { retryWithBackoff, DEFAULT_RETRY_OPTIONS } from "./retry/retryUtil"
export { extractIpAddress } from "./request/requestUtil"

// LLM types (pure data models)
export { LlmQuery } from "./llm/LlmQuery"
export { LlmQueryImpl } from "./llm/LlmQueryImpl"
export { LlmQAndA } from "./llm/LlmQAndA"
export { LlmAnswerMeta } from "./llm/LlmAnswerMeta"
export { LlmResponse } from "./llm/LlmResponse"
export { LlmConversationService } from "./llm/LlmConversationService"

// Email models (pure data, no SMTP)
export { GpEmail } from "./email/GpEmail"
export { GpEmailGroup } from "./email/GpEmailGroup"
export { GpEmailMixedMultipart } from "./email/GpEmailMixedMultipart"
export { GpEmailPart } from "./email/GpEmailPart"

// OpenTelemetry (pure interfaces and no-ops)
export { AddEventHandlerService } from "./opentelemetry/AddEventHandlerService"
export { SpanEndHandlingService } from "./opentelemetry/SpanEndHandlingService"
export { NoOpAddEventHandler } from "./opentelemetry/api/NoOpAddEventHandler"
export { NoOpSpanEndHandler } from "./opentelemetry/api/NoOpSpanEndHandler"

// Document Store interfaces
export { DEFAULT_RETRY_POLICY, AGGRESSIVE_RETRY_POLICY } from "./documentstore/RetryPolicy"
export { DEFAULT_READ_AFTER_WRITE_OPTIONS, FAST_READ_AFTER_WRITE_OPTIONS, PATIENT_READ_AFTER_WRITE_OPTIONS } from "./documentstore/ReadAfterWriteOptions"

// EXCLUDED (Node-only):
// - TerraformParserServiceImpl (fs/promises)
// - TerraformToEnvConversionServiceImpl (fs/promises)
// - parseDotenvContent, parseArgs, runSetEnv (fs/promises)
// - TraceInitializer (commented out in main index too)
