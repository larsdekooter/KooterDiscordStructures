import { ComponentType } from "discord-api-types/v10";
import { MessageComponentInteraction } from "../MessageComponentInteraction";

export type CollectorOptions = {
  filter?: (interaction: MessageComponentInteraction) => void;
  max?: number;
  type?: ComponentType;
  time?: number;
};
