import { Collection } from "@discordjs/collection";
import { Routes } from "discord-api-types/v10";
import { Channel } from "./Channel.js";
import { Client } from "./Client.js";
import { Guild } from "./Guild.js";
import { GuildChannelManager } from "./Managers/GuildChannelManager.js";
import { Member } from "./Member.js";
import { PermissionsBitField } from "./PermissionsBitField.js";
import { findChannelType } from "./Util/Channel.js";

export class PartialGuild {
  id: string;
  client: Client;
  name: string;
  icon?: string;
  owner?: string;
  permissions: PermissionsBitField;
  features: string[];
  channels: GuildChannelManager;
  constructor(guild: any, client: Client) {
    this.client = client;
    this.id = guild.id;
    this.name = guild.name;
    this.icon = guild.icon;
    this.owner = guild.owner;
    this.permissions = new PermissionsBitField(guild.permissions);
    this.features = guild.features;
    this.channels = new GuildChannelManager(this.client, guild);
  }
  async fetchChannels(): Promise<Collection<string, Channel>> {
    const rest = this.client.rest;
    const channels = (await rest.get(Routes.guildChannels(this.id))) as any[];
    return channels.reduce(
      (coll: Collection<string, Channel>, channel) =>
        coll.set(channel.id, findChannelType(channel, this.client)),
      new Collection<string, Channel>()
    );
  }
  async fetch(withCounts = true): Promise<Guild> {
    const apiGuild = await this.client.rest.get(
      `/guilds/${this.id}?with_counts=true`
    );

    const guild = new Guild(apiGuild, this.client);
    this.client.guilds.cache.set(guild.id, guild);
    return guild;
  }
  get partial() {
    if (this instanceof PartialGuild) return true;
    return false;
  }
  leave() {
    return this.client.user.leaveGuild(this.id);
  }
}
