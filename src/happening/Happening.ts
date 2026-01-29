// Cross-specification alignment:
// - OpenTelemetry: https://opentelemetry.io/docs/specs/otel/logs/data-model/
// - CloudEvents: https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
// - ReBAC (Zanzibar): https://authzed.com/docs/spicedb/concepts/zanzibar
//
// NAMING DECISION (2026-01-27):
// We use "actor" and "resource" instead of ReBAC's "subject"/"object" or CloudEvents' "subject"
// because those terms conflict (ReBAC subject = actor, CloudEvents subject = resource).
// See: doc/conversation-starter/LEARNINGS_20260127_subject_object_naming_rebac_cloudevents.md
// See: https://xkcd.com/927/

export interface Happening {
  eventAt: Date,                  // OTel: timestamp, CloudEvents: time
  appName: string,
  type: string,                   // CloudEvents: type (e.g., "com.app.user.created")

  // --- Actor: Who/what initiated the event ---
  // Maps to: ReBAC subject, CloudEvents source
  actorType?: string,             // e.g., "user", "service", "apiKey", "group"
  actorId?: string,               // Prefer over userId for non-user actors.

  // --- Resource: The thing being acted upon ---
  // Maps to: ReBAC object, CloudEvents subject
  resourceType?: string,          // e.g., "document", "folder", "account", "job"
  resourceId?: string,

  // --- Action: The operation performed (CRUDL) ---
  // Maps to: ReBAC relation/action
  action?: string,                // Use CRUDL: "create", "read", "update", "delete", "list"

  attributes: { [key: string]: string | number | boolean }  // OTel: attributes, CloudEvents: data/extensions

  referrer?: string,
  groupId?: string,
  userId?: string,
  userAgent?: string,
  clientIpAddress?: string,       // Real client IP (from X-Forwarded-For)
  proxyIpAddress?: string,        // Proxy/load balancer IP (direct socket connection)
  serverIpAddress?: string
  serverPort?: number,
  tags?: string,
  browser?: string,
  os?: string,
  errorType?: string,
  errorValue?: string,
  serverVersion?: string,         // Backend version serving the request
  clientVersion?: string,         // Frontend/SPA version (same as server for SSR)
  eventId?: string,               // CloudEvents: id (unique event identifier)
  authToken?: string,
  sessionId?: string,
  uniqueVisitorToken?: string
  ingestedAt?: Date,        // When record entered our system (for bulk imports; distinct from eventAt)
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
  // Viewport dimensions (visible document area, from X-Screen-Dimensions header second part)
  viewportHeight?: number,
  viewportWidth?: number,
  // Screen dimensions (full screen size, from X-Screen-Dimensions header first part)
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