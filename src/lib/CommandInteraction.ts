import { ModalBuilder } from "@discordjs/builders";
import { Collection } from "@discordjs/collection";
import { Channel } from "diagnostics_channel";
import {
  APIApplicationCommandInteraction,
  APIApplicationCommandOption,
  APIInteractionDataResolved,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  Routes,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { Member } from "./Member.js";
import { ModalCollector } from "./ModalCollector.js";
import { ModalSubmitInteraction } from "./ModalSubmitInteraction.js";
import { RepliableInteraction } from "./RepliableInteraction.js";
import { Role } from "./Role.js";
import { User } from "./User.js";
import { Channels, findChannelType } from "./Util/Channel.js";
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
  transformOption(
    option: ApplicationCommandOption,
    resolved: APIInteractionDataResolved
  ) {
    const result: CommandInteractionOption = {
      name: option.name,
      type: option.type,
    };

    if ("value" in option) result.value = option.value;
    if ("options" in option)
      result.options = option.options!.map((opt) =>
        this.transformOption(opt, resolved)
      );
    if (resolved) {
      const user = resolved.users?.[option.value!];
      if (user) result.user = new User(user, this.client);
      const member = resolved.members?.[option.value!];

      if (member) {
        (member as any).user = result.user;
        result.member = new Member(member, this.guildId!, this.client);
      }

      const channel = resolved.channels?.[option.value!];
      if (channel) result.channel = findChannelType(channel, this.client);

      const role = resolved.roles?.[option.value!];
      if (role) result.role = new Role(role, this.guild!);

      const attachment = resolved.attachments?.[option.value!];
      if (attachment) result.attachment = attachment;
    }
    return result;
  }
}

export type ApplicationCommandOption = {
  name: string;
  type: ApplicationCommandOptionType;
  value?: string;
  options?: ApplicationCommandOption[];
};

export type CommandInteractionOption = {
  name: string;
  type: ApplicationCommandOptionType;
  value?: string;
  options?: CommandInteractionOption[];
  user?: User;
  member?: Member;
  channel?: Channels;
  role?: Role;
  attachment?: any;
};
