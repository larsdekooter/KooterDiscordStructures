import {
  ActionRowBuilder,
  ButtonBuilder,
  RestOrArray,
} from "@discordjs/builders";
import {
  APIActionRowComponentTypes,
  APIMessageComponentEmoji,
  ComponentType,
} from "discord-api-types/v10";
import { Button } from "./Button.js";
import { Client } from "./Client.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { Response } from "./Util/HTTPTypes.js";

export type ButtonInteractionData = {
  customId: string;
  componentType: ComponentType;
};
export class ButtonInteraction extends MessageComponentInteraction {
  data: ButtonInteractionData;
  constructor(res: Response, i: any, client: Client) {
    super(res, i, client);
    this.data = {
      customId: i.data.custom_id,
      componentType: i.data.component_type,
    };
  }
  async disableButtons() {
    const rows = this.message.components;
    rows.forEach((row) => {
      row.components.forEach((component) => {
        if (component.data.type === ComponentType.Button) {
          return new ButtonBuilder()
            .setDisabled(true)
            .setStyle((component as Button).style)
            .setLabel((component as Button).label as string)
            .setEmoji((component as Button).emoji as APIMessageComponentEmoji)
            .setCustomId((component as Button).cutomId)
            .setURL((component as Button).url);
        }
      });
    });
    return await this.message.edit({
      components: rows.map((row) => {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
          row.components as unknown as ButtonBuilder[]
        );
      }),
    });
  }
}
