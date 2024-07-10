export interface TgpEmailPart {
  contentType: string,
  contentDisposition: string,
  contextTransferEncoding: string,
  
  // vs body?
  payload: string
}