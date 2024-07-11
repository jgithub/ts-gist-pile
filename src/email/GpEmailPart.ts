export interface GpEmailPart {
  contentType: string,
  contentDisposition: string,
  contextTransferEncoding: string,
  
  // vs body?
  payload: string
}