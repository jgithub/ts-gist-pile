import { TgpEmail } from "./TgpEmail";
import { TgpEmailPart } from "./TgpEmailPart";

export interface TgpEmailGroup {
  label?: string,
  emails?: Array<TgpEmail>,
  subGroups?: Array<TgpEmailGroup>
}