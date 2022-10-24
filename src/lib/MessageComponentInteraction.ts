import {
  ActionRowBuilder,
  AnyComponentBuilder,
  ButtonBuilder,
  ComponentBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import {
  APIMessageComponentEmoji,
  InteractionResponseType,
  Routes,
} from "discord-api-types/v10";
import { ReplyOptions } from "./Util/ReplyOptions.js";
import { Message } from "./Message.js";
import { RepliableInteraction } from "./RepliableInteraction.js";
import { Response } from "./Util/HTTPTypes.js";
import { Client } from "./Client.js";
import { Button } from "./Button.js";
import { SelectMenu } from "./SelectMenu.js";

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
    await this.client.rest.post(
      Routes.interactionCallback(this.id, this.token),
      {
        body: {
          type: InteractionResponseType.DeferredMessageUpdate,
          data: undefined,
        },
        auth: false,
      }
    );
    this.replied = true;
  }

  async update(options: ReplyOptions) {
    if (this.replied || this.deferred) throw new Error("Already Replied!");
    await this.client.rest.post(
      Routes.interactionCallback(this.id, this.token),
      {
        body: {
          data: options,
          type: InteractionResponseType.UpdateMessage,
        },
        auth: false,
      }
    );
    this.replied = true;
    return options.fetchReply ? this.fetchReply() : undefined;
  }
  async disableComponents() {
    const rows = this.message.components;
    rows.forEach((row) => {
      row.components.forEach((component) => {
        if (component instanceof Button) {
          return new ButtonBuilder()
            .setDisabled(true)
            .setCustomId(component.cutomId)
            .setEmoji(component.emoji as APIMessageComponentEmoji)
            .setLabel(component.label as string)
            .setStyle(component.style)
            .setURL(component.url);
        } else if (component instanceof SelectMenu) {
          return new SelectMenuBuilder()
            .setDisabled(true)
            .setCustomId(component.customId)
            .addOptions(component.options)
            .setCustomId(component.customId)
            .setMaxValues(component.maxValues!)
            .setMinValues(component.minValues!)
            .setPlaceholder(component.placeholder!);
        }
      });
    });
    await this.message.edit({
      components: rows as unknown as ActionRowBuilder<
        ButtonBuilder | SelectMenuBuilder
      >[],
    });
  }
}
