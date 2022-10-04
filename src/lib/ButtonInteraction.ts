import { ButtonBuilder } from "@discordjs/builders";
import { ComponentType } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { Response } from "./Util/HTTPTypes.js";

export type ButtonInteractionData = {
  customId: string;
};
export class ButtonInteraction extends MessageComponentInteraction {
  data: ButtonInteractionData;
  constructor(res: Response, i: any, client: Client) {
    super(res, i, client);
    this.data = { customId: i.data.custom_id };
  }
  async disableButtons() {
    const rows = this.message.components;
    rows.forEach((row) => {
      row.components.forEach((component) => {
        if (component.data.type === ComponentType.Button) {
          (component as ButtonBuilder).setDisabled(true);
        }
      });
    });
    return await this.message.edit({ components: rows });
  }
}
