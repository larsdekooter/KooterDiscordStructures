import {
  APIGuildMember,
  APIMessage,
  APIUser,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { CommandInteractionOption } from "./ChatInputCommandInteraction";
import { Client } from "./Client";
import { Member } from "./Member";
import { Message } from "./Message";
import { TextChannel } from "./TextChannel";
import { User } from "./User";

export type CommandInteractionDataOptions = {
  messages?: {
    [key: string]: APIMessage;
  };
  members?: { [key: string]: APIGuildMember };
  users?: { [key: string]: APIUser };
};

export class CommandInteractionOptionResolver {
  options: CommandInteractionDataOptions;
  client: Client;
  guildId?: string;
  private _group: string | null;
  private _subcommand: string | null;
  private _hoistedOptions: CommandInteractionOption[];
  constructor(
    options: CommandInteractionOption[],
    client: Client,
    guildId?: string
  ) {
    this.client = client;
    this.guildId = guildId;
    this._group = null;
    this._subcommand = null;
    this._hoistedOptions = options;
    if (
      this._hoistedOptions[0]?.type ===
      ApplicationCommandOptionType.SubcommandGroup
    ) {
      this._group = this._hoistedOptions[0].name;
      this._hoistedOptions = this._hoistedOptions[0].options ?? [];
    }
    if (
      this._hoistedOptions[0]?.type === ApplicationCommandOptionType.Subcommand
    ) {
      this._subcommand = this._hoistedOptions[0].name;
      this._hoistedOptions = this._hoistedOptions[0].options ?? [];
    }
  }
  get(name: string, required = false) {
    const option = this._hoistedOptions.find((opt) => opt.name === name);
    if (!option) {
      if (required) {
        throw new Error(`Couldn't find required option ${name}`);
      }
      return null;
    }
    return option;
  }
  private getTypedOption(
    name: string,
    type: ApplicationCommandOptionType,
    properties: string[],
    required: boolean
  ) {
    const option = this.get(name, required);
    if (!option) {
      return null;
    } else if (option.type !== type) {
      throw new Error(`Option is of type ${option.type}, but expected ${type}`);
    } else if (
      required &&
      properties.every(
        (prop) => option[prop] === null || typeof option[prop] === "undefined"
      )
    ) {
      throw new Error(`Option ${name} found, but no values exist`);
    }
    return option;
  }
  getSubcommand(required = true) {
    if (required && !this._subcommand) {
      throw new Error("No subcommand on this command");
    }
    return this._subcommand as string;
  }
  getSubcommandGroup(required = true) {
    if (required && !this._group) {
      throw new Error("No Subcommand Group found");
    }
    return this._group as string;
  }
  getBoolean(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.Boolean,
      ["value"],
      required
    );
    return (option?.value as boolean | undefined) ?? null;
  }
  getChannel(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.Channel,
      ["channel"],
      required
    );
    return option?.channel ?? null;
  }
  getString(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.String,
      ["value"],
      required
    );
    return (option?.value as string | undefined) ?? null;
  }
  getInteger(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.Integer,
      ["value"],
      required
    );
    return option?.value ?? null;
  }
  getNumber(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.Number,
      ["value"],
      required
    );
    return option?.value ?? null;
  }
  getUser(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.User,
      ["user"],
      required
    );
    return option?.user ?? null;
  }
  getMember(name: string) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.User,
      ["member"],
      false
    );
    return option?.member ?? null;
  }
  getRole(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.Role,
      ["role"],
      required
    );
    return option?.role ?? null;
  }
  getAttachment(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.Attachment,
      ["attachment"],
      required
    );
    return option?.attachment ?? null;
  }
  getMentionable(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      ApplicationCommandOptionType.Mentionable,
      ["user", "member", "role"],
      required
    );
    return option?.member ?? option?.user ?? option?.role ?? null;
  }
  getMessage(name: string, required = false) {
    const option = this.getTypedOption(
      name,
      "_MESSAGE" as any,
      ["message"],
      required
    );
    return option?.message ?? null;
  }
  getFocused(getFull = false) {
    const focusedOption = this._hoistedOptions.find(
      (option) => (option as any).focused
    );
    if (!focusedOption) throw new Error("No focused Option");
    return getFull ? focusedOption : focusedOption.value;
  }
}
