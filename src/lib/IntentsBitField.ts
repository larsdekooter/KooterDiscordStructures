import { GatewayIntentBits } from "discord-api-types/v10";
import { BitField } from "./BitField.js";

export class IntentsBitfield extends BitField {
  static Flags = GatewayIntentBits;
}
