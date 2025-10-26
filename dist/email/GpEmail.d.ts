import { GpEmailMixedMultipart } from "./GpEmailMixedMultipart";
export interface GpEmail {
    mesageId?: string;
    to?: string;
    from?: string;
    subject?: string;
    cc?: string;
    bcc?: string;
    date?: string;
    mixedMultipart?: GpEmailMixedMultipart;
}
