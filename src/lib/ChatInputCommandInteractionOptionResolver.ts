import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Attachment } from "./Util/InteractionOptionType.js";
import { Option, ResolvedOptions } from "./Util/OptionTypes.js";
import { Channel } from "./Channel.js";
import {
  ChatInputCommandInteraction,
  CommandInteractionOption,
} from "./ChatInputCommandInteraction.js";
import { Member } from "./Member.js";
import { Role } from "./Role.js";
import { User } from "./User.js";
import { Guild } from "./Guild.js";
import { findChannelType } from "./Util/Channel.js";

export class ChatInputCommandInteractionOptionResolver {
  #interaction: ChatInputCommandInteraction;
  #resolvedOptions: ResolvedOptions;
  #stringOptions: Option<string>[];
  #userOptions: Option<string>[];
  #attachmentOptions: Option<string>[];
  #booleanOptions: Option<boolean>[];
  #channelOptions: Option<string>[];
  #roleOptions: Option<string>[];
  #integerOptions: Option<number>[];
  #mentionableOptions: Option<string>[];
  #numberOptions: Option<number>[];
  options: CommandInteractionOption[];
  constructor(interaction: ChatInputCommandInteraction) {
    this.#interaction = interaction;
    this.options = [];
    const options = interaction.data.options ?? [
      { type: 200, name: "", value: "" },
    ];

    if (options[0].type === ApplicationCommandOptionType.SubcommandGroup) {
      this.options = options[0].options![0]
        .options as CommandInteractionOption[];
    } else if (options[0].type === ApplicationCommandOptionType.Subcommand) {
      this.options = options[0].options as CommandInteractionOption[];
    } else {
      this.options = options;
    }

    this.#resolvedOptions = interaction.data.resolved;

    this.#stringOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.String
    ) as Option<string>[] | [];

    this.#channelOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.Channel
    ) as Option<string>[];

    this.#userOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.User
    ) as Option<string>[];

    this.#attachmentOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.Attachment
    ) as Option<string>[];

    this.#booleanOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.Boolean
    ) as unknown as Option<boolean>[];

    this.#roleOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.Role
    ) as Option<string>[];

    this.#integerOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.Integer
    ) as unknown as Option<number>[];

    this.#mentionableOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.Mentionable
    ) as Option<string>[];
    this.#numberOptions = this.options.filter(
      (option) => option.type === ApplicationCommandOptionType.Number
    ) as unknown as Option<number>[];
  }
  getString(name: string): string | null {
    const stringOption = this.#stringOptions.find(
      (option) => option.name === name
    );
    return stringOption?.value ?? null;
  }
  getUser(name: string): User | null {
    const userOption = this.#userOptions.find((option) => option.name === name);
    if (!userOption) return null;
    const user: any = this.#resolvedOptions.users![userOption.value];

    return new User(user, this.#interaction.client);
  }
  getMember(name: string): Member | null {
    const userOption = this.#userOptions.find((option) => option.name === name);
    if (!userOption) return null;

    const member = this.#resolvedOptions.members![userOption.value];
    member.user = this.#resolvedOptions.users![userOption.value];

    return new Member(member, this.#interaction.guild as Guild);
  }
  getAttachment(name: string): Attachment | null {
    const attachmentOption = this.#attachmentOptions.find(
      (option) => option.name === name
    );
    if (!attachmentOption) return null;

    const attachemnt =
      this.#resolvedOptions.attachments![attachmentOption.value];

    return attachemnt as Attachment;
  }
  getBoolean(name: string): boolean | null {
    const booleanOption = this.#booleanOptions.find(
      (option) => option.name === name
    );
    if (!booleanOption) return null;
    return booleanOption.value;
  }
  getChannel(name: string): Channel | null {
    const channelOption = this.#channelOptions.find(
      (option) => option.name === name
    );
    if (!channelOption) return null;

    const channel = this.#resolvedOptions.channels![channelOption.value];
    return this.#interaction.client.channels.cache.get(channel.id) ?? null;
  }
  getRole(name: string): Role | null {
    if (this.#roleOptions.length === 0) return null;

    const roleOption = this.#roleOptions.find((option) => option.name === name);
    if (!roleOption) return null;

    const role = this.#resolvedOptions.roles![roleOption.value];

    if (this.#interaction.guild) {
      return new Role(role, this.#interaction.guild);
    }
    return null;
  }
  getInteger(name: string): Number | null {
    const integerOption = this.#integerOptions.find(
      (option) => option.name === name
    );
    if (!integerOption) return null;

    return integerOption.value;
  }
  getMentionable(name: string): User | Channel | Role | null {
    const mentionableOption = this.#mentionableOptions.find(
      (option) => option.name === name
    );
    if (!mentionableOption) return null;
    if (this.#interaction.guild) {
      const value =
        new User(
          this.#resolvedOptions.users![mentionableOption.value],
          this.#interaction.client
        ) ||
        findChannelType(
          this.#resolvedOptions.channels![mentionableOption.value],
          this.#interaction.client
        ) ||
        new Role(
          this.#resolvedOptions.roles![mentionableOption.value],
          this.#interaction.guild
        );
      return value;
    }
    return null;
  }
  getNumber(name: string): Number | null {
    const numberOption = this.#numberOptions.find(
      (option) => option.name === name
    );
    if (!numberOption) return null;

    return numberOption.value;
  }
  getSubcommandGroup() {
    if (!this.#interaction.data.options) return null;

    return (
      this.#interaction.data.options.find(
        (option) => option.type === ApplicationCommandOptionType.SubcommandGroup
      )?.name ?? null
    );
  }
  getSubCommand() {
    if (!this.#interaction.data.options) return null;

    const firstOptions = this.#interaction.data.options.find(
      (option) => option.type === ApplicationCommandOptionType.Subcommand
    );

    if (!firstOptions) {
      return (
        this.#interaction.data.options
          ?.find(
            (option) =>
              option.type === ApplicationCommandOptionType.SubcommandGroup
          )
          ?.options?.find(
            (option) => option.type === ApplicationCommandOptionType.Subcommand
          )?.name ?? null
      );
    }
    return firstOptions.name ?? null;
  }
  get(name: string) {
    if (this.options.length === 0) return null;

    const option = this.options.find((option) => option.name === name);
    if (!option) return null;

    return option.value;
  }
}
