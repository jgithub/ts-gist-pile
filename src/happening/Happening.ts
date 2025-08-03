// https://opentelemetry.io/docs/specs/otel/logs/data-model/

export interface Happening {
  timestamp: Date,
  serviceName: string,
  code: string,
  description?: string,
  resourceType?: string,
  resourceCrudl?: string,
  subResource?: string,
  resourceCrudlResult?: string,
  resourceId?: string,
  resourceInstanceName?: string,
  initiatorAction?: string,
  param?: string,
  param2?: string,  
  param3?: string,  
  referrer?: string,
  groupId?: string,
  snapshotGroupName?: string,
  userId?: string,
  snapshotUserName?: string,
  userAgentOriginal?: string,
  clientAddress?: string,
  userAgentName?: string,
  networkPeerAddress?: string,
  tags?: string,
  browser?: string,
  os?: string,
  reason?: string,
  comment?: string,
  errorType?: string,
  exceptionMessage?: string,
  serviceVersion?: string,
  source?: string,
  target?: string,
  document?: string,
  authToken?: string,
  sessionId?: string,
  uniqueBrowserToken?: string
  recordCreatedAt?: Date,
  serverAddress?: string,
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
  attributes: { [key: string]: string | number | boolean }
  spanId?: string,
  traceId?: string,
  
  // Network/Protocol attributes
  serverPort?: number,
  clientPort?: number,
  networkTransport?: string,
  networkProtocolName?: string,
  networkProtocolVersion?: string,
  
  // Service/Environment attributes
  peerService?: string,
  serviceNamespace?: string,
  serviceInstanceId?: string,
  
  // Execution context
  threadId?: string,
  threadName?: string,
  
  // HTTP-specific attributes
  httpMethod?: string,
  httpStatusCode?: number,
  httpUrl?: string,
  httpRoute?: string,
  
  // Additional Error/Exception attributes

  exceptionStacktrace?: string,
}