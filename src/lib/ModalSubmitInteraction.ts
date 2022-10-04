import { ActionRowBuilder, TextInputBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v10";
import {
  InteractionResponseFlags,
  InteractionResponseType,
} from "discord-interactions";
import { Client } from "./Client.js";
import { Message } from "./Message.js";
import { RepliableInteraction } from "./RepliableInteraction.js";
import { Response } from "./Util/HTTPTypes.js";

export type ModalSubmitInteractionData = {
  components: ActionRowBuilder<TextInputBuilder>[];
};

export class ModalSubmitInteraction extends RepliableInteraction {
  customId: string;
  message: Message | null;
  data: ModalSubmitInteractionData;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.customId = interaction.data.custom_id;
    this.message = interaction.message
      ? new Message(interaction.message, this.client)
      : null;
    this.data = interaction.data;

    this.data.components = interaction.data.components.map(
      (row: any) =>
        new ActionRowBuilder({
          components: row.components,
        })
    );
  }
  getTextInputValue(customId: string) {
    const ret: string[] = [];
    this.data.components.map((row) => {
      const val = row.components.find(
        (comp) => comp.data.custom_id === customId
      );
      if (val) ret.push(val.data.value as string);
    });
    return ret[0] ?? null;
  }

  async editMessage(options: any) {
    await this.rest.patch(
      Routes.channelMessage(this.channelId, this.message!.id),
      {
        body: options,
      }
    );
  }
}
