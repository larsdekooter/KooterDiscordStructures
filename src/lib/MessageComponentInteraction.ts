import {
  ActionRowBuilder,
  AnyComponentBuilder,
  ButtonBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { InteractionResponseType } from "discord-api-types/v10";
import { ReplyOptions } from "./Util/ReplyOptions.js";
import { Message } from "./Message.js";
import { RepliableInteraction } from "./RepliableInteraction.js";
import { Response } from "./Util/HTTPTypes.js";
import { Client } from "./Client.js";

export class MessageComponentInteraction extends RepliableInteraction {
  message: Message;
  customId: string;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.message = new Message(interaction.message, this.client);
    this.customId = interaction.data.custom_id;
  }

  async deferUpdate() {
    if (this.replied || this.deferred) throw new Error("Already Replied");
    await this.res.send({
      type: InteractionResponseType.DeferredMessageUpdate,
      data: undefined,
    });
    this.replied = true;
  }

  async disableComponents(
    components?: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[]
  ) {
    const rows = components ?? this.message.components;
    rows.forEach((row) => {
      row.components.forEach((component: SelectMenuBuilder | ButtonBuilder) => {
        component.setDisabled(true);
      });
    });
    await this.message.edit({ components: rows });
  }
  async update(options: ReplyOptions) {
    if (this.replied || this.deferred) throw new Error("Already Replied!");
    await this.res.send({
      data: options,
      type: InteractionResponseType.UpdateMessage,
    });
    this.replied = true;
    return options.fetchReply ? this.fetchReply() : undefined;
  }
}
