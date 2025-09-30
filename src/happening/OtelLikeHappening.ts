export type OtelLikeHappening = {
  // Event identity
  "event.domain": "security" | "system" | "transaction" | "audit" | "browser" | string;
  // If you don't set LogRecord.EventName, set this:
  "event.name"?: string;

  // HTTP / URL / Net
  "url.full"?: string;
  "url.path"?: string;
  "http.response.status_code"?: number;
  "client.address"?: string;
  "client.port"?: number;
  "server.address"?: string;
  "server.port"?: number;

  // User / Session / UA
  "user.id"?: string;
  "session.id"?: string;
  "user_agent.original"?: string;
  "user_agent.name"?: string;
  "user_agent.version"?: string;

  // Geo (optional)
  "client.geo.country"?: string;
  "client.geo.region"?: string;
  "client.geo.city"?: string;
  "client.geo.postal_code"?: string;
  "client.geo.latitude"?: number;
  "client.geo.longitude"?: number;

  // Exceptions
  "exception.type"?: string;
  "exception.message"?: string;
  "exception.stacktrace"?: string;

  // Your domain fields (namespaced)
  "resource.type"?: string;
  "resource.action"?: string;
  "resource.id"?: string;
  "resource.subresource"?: string;
  "target.id"?: string;
  "auth.reason"?: string;
  "auth.result"?: string;

  // Anything else you had as "attributes" stays here as first-class attributes.
  [k: `${string}.${string}`]: string | number | boolean | string[] | number[] | boolean[];
};

// Resource attributes (set once per emitter, not per-event)
export type OtelResource = {
  "service.name": string;           // from appName
  "service.version"?: string;       // from appVersion
  "host.name"?: string;             // from serverName/hostname
  "deployment.environment.name"?: string;
};