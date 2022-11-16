import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { InteractionType } from "discord-interactions";
import { ResolvedOptions } from "./Util/OptionTypes.js";

import { ChatInputCommandInteractionOptionResolver } from "./ChatInputCommandInteractionOptionResolver.js";
import { Response } from "./Util/HTTPTypes.js";
import { Client } from "./Client.js";
import { CommandInteraction } from "./CommandInteraction.js";
import { User } from "./User.js";
import { Member } from "./Member.js";
import { Channel } from "./Channel.js";
import { Role } from "./Role.js";
import { Attachment } from "./Util/InteractionOptionType.js";
import { Message } from "./Message.js";
import { CommandInteractionOptionResolver } from "./CommandInteractionOptionResolver.js";
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
  value?: string | boolean | number;
  options?: CommandInteractionOption[];
  autocomplete?: boolean;
  user?: User;
  member?: Member;
  channel?: Channel;
  role?: Role;
  attachment?: Attachment;
  message?: Message;
};

export class ChatInputCommandInteraction extends CommandInteraction {
  data: CommandInteractionData;
  options: Omit<CommandInteractionOptionResolver, "getMessage" | "getFocused">;
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
    this.options = new CommandInteractionOptionResolver(
      interaction.data.options?.map((option) =>
        this.transformOption(option, interaction.data.resolved)
      ) ?? [],
      this.client,
      this.guildId
    );
  }

  get commandName() {
    return this.data.name;
  }
}
