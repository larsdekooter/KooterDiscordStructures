import { ModalBuilder } from "@discordjs/builders";
import { Collection } from "@discordjs/collection";
import {
  APIApplicationCommandInteraction,
  ApplicationCommandType,
  InteractionResponseType,
  Routes,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { ModalCollector } from "./ModalCollector.js";
import { ModalSubmitInteraction } from "./ModalSubmitInteraction.js";
import { RepliableInteraction } from "./RepliableInteraction.js";
import { Response } from "./Util/HTTPTypes.js";
import { AwaitModalSubmitOptions } from "./Util/ReplyOptions.js";

export class CommandInteraction extends RepliableInteraction {
  commandType: ApplicationCommandType;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.commandType = interaction.data.type;
  }
  async awaitModalSubmit(
    options: AwaitModalSubmitOptions
  ): Promise<ModalSubmitInteraction> {
    return new Promise((resolve, reject) => {
      const collector = new ModalCollector(
        options,
        this.client,
        this.channelId
      );
      collector.once(
        "end",
        (
          collected: Collection<string, ModalSubmitInteraction>,
          reason: string
        ) => {
          const interaction = collected.first();
          if (interaction) resolve(interaction);
          else reject(new Error("Collector ended with reason: " + reason));
        }
      );
    });
  }
  async showModal(modal: ModalBuilder) {
    if (this.replied || this.deferred)
      throw new Error("Already replied to this interaction!");
    await this.client.rest.post(
      Routes.interactionCallback(this.id, this.token),
      {
        body: {
          type: InteractionResponseType.Modal,
          data: modal,
        },
        auth: false,
      }
    );
    this.replied = true;
  }
}
