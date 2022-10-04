import { ComponentType } from "discord-api-types/v10";
import { Client } from "./Client";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { Response } from "./Util/HTTPTypes";

export type SelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];
};

export class SelectMenuInteraction extends MessageComponentInteraction {
  data: SelectMenuInteractionData;
  values: string[];
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      values: interaction.data.values,
    };
    this.values = this.data.values;
  }
}
