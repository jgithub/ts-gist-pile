export type OtelLikeHappening = {
  event_at: Date,  // timestamp
  
  service: {
    name: string;           // from appName
    version?: string;       // from appVersion
    namespace?: string; // from appEnvironment
  },

  event: {
    domain?: "security" | "system" | "transaction" | "audit" | "browser" | string;
    name: string;
    id?: string;        // from eventId
    value?: string;     // from eventValue, delimited?
  },

  url?: {
    full?: string;
    path?: string;
  }, 

  // what about route?   query?

  http?: {
    response?: {
      status_code?: number;
    }
  },

  client?: {
    address?: string;
    port?: number;
    geo?: {
      country?: string;
      region?: string;
      city?: string;
      postal_code?: string;
      latitude?: number;
      longitude?: number;
    },
  },

  server?: {
    address?: string;
    port?: number;
    // name?: string; // from serverName/hostname
  },

  // https://opentelemetry.io/docs/specs/semconv/registry/attributes/
  // https://opentelemetry.io/docs/specs/semconv/registry/attributes/user/
  user?: {
    id?: string;
    name?: string;   // from snapshotUserName
  },

  // group?: {
  //   id?: string;
  // },

  // What about source?

  session?: {
    id?: string;
  },

  user_agent?: {
    original?: string;
    name?: string;
    version?: string;
  },

  // auth?: {
  //   reason?: string;
  //   result?: string;
  // },

  // target?: {
  //   id?: string;
  //   name?: string;
  // },

  // trace?: {
  //   traceId?: string;
  //   spanId?: string;
  //   traceFlags?: number;
  // },

  // Exception (if any)
  error?: {
    type?: string;
    message?: string;
    stacktrace?: string;
  },

  // resource?: {
  //   type?: string;
  //   action?: string;
  //   id?: string;
  //   subresource?: {
  //     id?: string;
  //   };
  // },

  [k: `${string}.${string}`]: string | number | boolean | string[] | number[] | boolean[];

  deployment?: {
    environment?: {
      name?: string;       // from appEnvironment
    }
  },

  record_created_at?: Date;  // from recordCreatedAt
  tags?: string[];
};
