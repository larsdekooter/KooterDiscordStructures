import { UserFlags } from "discord-api-types/v10";
import { BitField } from "./BitField.js";

export class UserFlagsBitfield extends BitField {
  static Flags = UserFlags;
}
