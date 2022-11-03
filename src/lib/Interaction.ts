import { Collection } from "@discordjs/collection";
import { REST } from "@discordjs/rest";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { Snowflake } from "discord-api-types/globals";
import {
  ApplicationCommandType,
  ComponentType,
  InteractionType,
} from "discord-api-types/v10";
import { AutocompleteInteraction } from "./AutocompleteInteraction.js";
import { ButtonInteraction } from "./ButtonInteraction.js";
import { Client } from "./Client.js";
import { ChatInputCommandInteraction } from "./ChatInputCommandInteraction.js";
import { Guild } from "./Guild.js";
import { Member } from "./Member.js";
import { ModalSubmitInteraction } from "./ModalSubmitInteraction.js";
import { PermissionsBitField } from "./PermissionsBitField.js";
import { RepliableInteraction } from "./RepliableInteraction.js";
import {
  BaseSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "./SelectMenuInteraction.js";
import { User } from "./User.js";
import { Response } from "./Util/HTTPTypes.js";
import { ContextMenuCommandInteraction } from "./ContextMenuCommandInteraction.js";
import { CommandInteraction } from "./CommandInteraction.js";
import { UserContextMenuCommandInteraction } from "./UserContextMenuCommandInteraction.js";
import { MessageContextMenuCommandInteraction } from "./MessageContextMenuCommandInteraction.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { interactionIsSelectMenuInteraction } from "./Util/Utils.js";

export class Interaction {
  res: Response;
  #GuildCache = new Collection<Snowflake, Guild>();
  id: string;
  applicationId: string;
  guildId?: string;
  channelId: string;
  user: User;
  token: string;
  version: string;
  locale: string;
  guildLocale: string;
  replied = false;
  deferred = false;
  type: InteractionType;
  rest: REST;
  client: Client;
  _member: Object;
  member: Member | null;
  guild: Guild | null;
  appPermissions: PermissionsBitField;

  constructor(res: Response, interaction: any, client: Client) {
    this.rest = client.rest;
    this.id = interaction.id;
    this.applicationId = interaction.application_id;
    this.guildId = interaction.guild_id;
    this.channelId = interaction.channel_id;
    this.user = new User(interaction.member.user, client);
    this.token = interaction.token;
    this.version = interaction.version;
    this.locale = interaction.locale;
    this.guildLocale = interaction.guild_locale;
    this.replied = false;
    this.deferred = false;
    this.res = res;
    this.type = interaction.type;
    this.client = client;
    this._member = interaction.member;
    this.member = null;
    this.guild = null;
    this.appPermissions = new PermissionsBitField(interaction.app_permissions);
  }
  isModalSubmit(): this is ModalSubmitInteraction {
    return this.type === InteractionType.ModalSubmit;
  }
  isCommand(): this is CommandInteraction {
    return this.type === InteractionType.ApplicationCommand;
  }
  isChatInputCommand(): this is ChatInputCommandInteraction {
    return (
      this.isCommand() && this.commandType === ApplicationCommandType.ChatInput
    );
  }
  isAutocomplete(): this is AutocompleteInteraction {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }
  isMessageComponentInteraction(): this is MessageComponentInteraction {
    return this.type === InteractionType.MessageComponent;
  }
  isButton(): this is ButtonInteraction {
    return (
      this.isMessageComponentInteraction() &&
      // @ts-ignore
      (this.data as any).component_type === ComponentType.Button
    );
  }
  isSelectMenu(): this is BaseSelectMenuInteraction {
    return (
      this.isMessageComponentInteraction() &&
      [
        ComponentType.ChannelSelect,
        ComponentType.MentionableSelect,
        ComponentType.RoleSelect,
        ComponentType.StringSelect,
        ComponentType.UserSelect,
      ].includes(this.data.componentType)
    );
  }
  isRepliable(): this is RepliableInteraction {
    return ![
      InteractionType.Ping,
      InteractionType.ApplicationCommandAutocomplete,
    ].includes(this.type);
  }
  isContextMenuCommand(): this is ContextMenuCommandInteraction {
    return (
      this.isCommand() &&
      [ApplicationCommandType.User, ApplicationCommandType.Message].includes(
        this.commandType
      )
    );
  }
  isUserContextMenuCommand(): this is UserContextMenuCommandInteraction {
    return (
      this.isContextMenuCommand() &&
      this.commandType === ApplicationCommandType.User
    );
  }
  isMessageContextMenuCommand(): this is MessageContextMenuCommandInteraction {
    return (
      this.isContextMenuCommand() &&
      this.commandType === ApplicationCommandType.Message
    );
  }
  inGuild() {
    return this.guild != undefined && this.guild !== null;
  }
  isChannelSelectMenuInteraction(): this is ChannelSelectMenuInteraction {
    return (
      this.isMessageComponentInteraction() &&
      this.data.componentType === ComponentType.ChannelSelect
    );
  }
  isMentionableSelectMenuInteraction(): this is MentionableSelectMenuInteraction {
    return (
      this.isMessageComponentInteraction() &&
      this.data.componentType === ComponentType.MentionableSelect
    );
  }
  isRoleSelectMenuInteraction(): this is RoleSelectMenuInteraction {
    return (
      this.isMessageComponentInteraction() &&
      this.data.componentType === ComponentType.RoleSelect
    );
  }
  isStringSelectMenuInteraction(): this is StringSelectMenuInteraction {
    return (
      this.isMessageComponentInteraction() &&
      this.data.componentType === ComponentType.StringSelect
    );
  }
  isUserSelectMenuInteraction(): this is UserSelectMenuInteraction {
    return (
      this.isMessageComponentInteraction() &&
      this.data.componentType === ComponentType.UserSelect
    );
  }
  async getGuild(force = false) {
    if (this.guildId) {
      if (this.#GuildCache.has(this.guildId) && !force)
        return this.#GuildCache.get(this.guildId);
      if (this.client.guilds.cache.has(this.guildId) && !force)
        return this.client.guilds.cache.get(this.guildId);
      const guild = await Guild.build(this.guildId, this.client);
      this.#GuildCache.set(this.guildId, guild);
      this.client.guilds.cache.set(guild.id, guild);
      return guild;
    }
  }
  async getChannel(force = false) {
    if (!force && this.client.channels.cache.has(this.channelId)) {
      const channel = this.client.channels.cache.get(this.channelId);
      if (!channel?.isTextBased()) return null;
      return channel;
    }
    const channel = await this.client.channels.fetch(this.channelId);
    if (!channel) return null;
    if (!channel.isTextBased()) return null;
    this.client.channels.cache.set(channel.id, channel);
    return channel;
  }
  get createdTimestamp() {
    return DiscordSnowflake.timestampFrom(this.id);
  }
  get createdAt() {
    return new Date(this.createdTimestamp);
  }
  get channel() {
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel?.isTextBased()) return null;
    return channel ?? null;
  }
  end() {
    this.client.emit("debug", `Interaction (${this.id}) ended`);
    this.res.end();
  }
}
