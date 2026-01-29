import { getLogger } from '../log/getLogger';
import { d4l } from '../log/logUtil';

const LOG = getLogger('request.requestUtil');

/**
 * Minimal interface for HTTP request objects that support header retrieval.
 * Compatible with Express Request, Node.js IncomingMessage, etc.
 */
export interface HttpRequestLike {
  get?(headerName: string): string | undefined;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string | null };
}

/**
 * Extracts the client IP address from an HTTP request, handling various proxy headers.
 *
 * Priority order:
 * 1. X-Forwarded-For header (first IP in the chain)
 * 2. X-Real-IP header
 * 3. Socket remote address
 *
 * @param req HTTP request object (Express Request, IncomingMessage, etc.)
 * @returns The client IP address or null if not available
 */
export function extractIpAddress(req: HttpRequestLike): string | null {
  const getHeader = (name: string): string | undefined => {
    if (req.get) {
      return req.get(name);
    }
    if (req.headers) {
      const value = req.headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    }
    return undefined;
  };

  const forwarded = getHeader('X-Forwarded-For');
  const realIp = getHeader('X-Real-IP');
  const socketAddr = req.socket?.remoteAddress || null;

  LOG.debug(() => `extractIpAddress(): X-Forwarded-For = ${d4l(forwarded)},  X-Real-IP = ${d4l(realIp)},  socket = ${d4l(socketAddr)}`);

  if (forwarded) {
    const firstIp = forwarded.split(',')[0];
    return firstIp ? firstIp.trim() : null;
  }

  if (realIp) {
    return realIp;
  }

  return socketAddr;
}
