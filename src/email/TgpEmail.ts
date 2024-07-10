import { TgpEmailMixedMultipart } from "./TgpEmailMixedMultipart";

export interface TgpEmail {
  mesageId?: string,
  to?: string,
  from?: string,
  subject?: string,
  cc?: string,
  bcc?: string,
  date?: string,
  mixedMultipart?: TgpEmailMixedMultipart
}