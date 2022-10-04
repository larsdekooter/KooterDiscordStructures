import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { InteractionType } from "discord-interactions";
import { ResolvedOptions } from "./Util/OptionTypes.js";

import { ChatInputCommandInteractionOptionResolver } from "./ChatInputCommandInteractionOptionResolver.js";
import { RepliableInteraction } from "./RepliableInteraction.js";
import { Response } from "./Util/HTTPTypes.js";
import { Client } from "./Client.js";
export type CommandInteractionData = {
  guildId: string;
  id: string;
  name: string;
  options: CommandInteractionOption[];
  type: InteractionType;
  resolved: ResolvedOptions;
};

export type CommandInteractionOption = {
  name: string;
  type: ApplicationCommandOptionType;
  value: string;
  options?: CommandInteractionOption[];
};

export class ChatInputCommandInteraction extends RepliableInteraction {
  data: CommandInteractionData;
  options: ChatInputCommandInteractionOptionResolver;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      guildId: interaction.data.guild_id,
      id: interaction.data.id,
      name: interaction.data.name,
      options: interaction.data.options,
      type: interaction.data.type,
      resolved: interaction.data.resolved,
    };
    this.options = new ChatInputCommandInteractionOptionResolver(this);
  }

  get commandName() {
    return this.data.name;
  }
}
