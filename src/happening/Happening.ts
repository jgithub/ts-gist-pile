// Cross-specification alignment:
// - OpenTelemetry: https://opentelemetry.io/docs/specs/otel/logs/data-model/
// - CloudEvents: https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
// - ReBAC (Zanzibar): https://authzed.com/docs/spicedb/concepts/zanzibar

export interface Happening {
  eventAt: Date,                  // OTel: timestamp, CloudEvents: time
  appName: string,
  type: string,                   // CloudEvents: type (e.g., "com.app.user.created")
  // --- Subject (Actor): Who/what initiated the event ---
  // ReBAC: subject, OTel: service.*, CloudEvents: source
  subjectType?: string,           // ReBAC: subject namespace (e.g., "user", "service", "apiKey", "group")
  subjectId?: string,             // ReBAC: subject id. Prefer over userId for non-user actors.

  // --- Object (Resource): The thing being acted upon ---
  // ReBAC: object, OTel: resource, CloudEvents: subject
  objectType?: string,            // ReBAC: object namespace (e.g., "document", "folder", "account")
  objectId?: string,              // ReBAC: object id

  // --- Relation & Action ---
  // ReBAC: relation + action
  action?: string,                // ReBAC: the operation (e.g., "read", "write", "delete", "share")

  attributes: { [key: string]: string | number | boolean }  // OTel: attributes, CloudEvents: data/extensions

  referrer?: string,
  groupId?: string,
  userId?: string,
  userAgent?: string,
  clientIpAddress?: string,
  derivedUserAgent?: string,
  derivedClientIpAddress?: string,
  serverIpAddress?: string
  serverPort?: number,
  tags?: string,
  browser?: string,
  os?: string,
  errorType?: string,
  errorValue?: string,
  appVersion?: string,
  eventId?: string,               // CloudEvents: id (unique event identifier)
  authToken?: string,
  sessionId?: string,
  uniqueVisitorToken?: string
  recordCreatedAt?: Date,   // This is the timestamp.
  serverName?: string,
  statusCode?: string,
  statusMessage?: string,
  url?: string,
  path?: string,
  batchStamp?: string,
  postalCode?: string,
  latitude?: string,
  longitude?: string,
  city?: string,
  region?: string,
  country?: string,  
  screenHeight?: number,
  screenWidth?: number,
  upstreamRecordId?: string, 

  // --- Distributed Tracing (OTel, CloudEvents traceparent extension) ---
  spanId?: string,                // OTel: span_id
  traceId?: string,               // OTel: trace_id, CloudEvents: traceparent extension
  severity?: string,              // OTel: severity_text
  duration?: number,
  hostname?: string
}