import { GpEmail } from "./GpEmail";
export interface GpEmailGroup {
    label?: string;
    emails?: Array<GpEmail>;
    subGroups?: Array<GpEmailGroup>;
}
