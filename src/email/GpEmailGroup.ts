import { GpEmail } from "./GpEmail";
import { GpEmailPart } from "./GpEmailPart";

export interface GpEmailGroup {
  label?: string,
  emails?: Array<GpEmail>,
  subGroups?: Array<GpEmailGroup>
}