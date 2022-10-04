import { Collection } from "@discordjs/collection";
import { makeURLSearchParams } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Channel } from "./Channel.js";
import { Client } from "./Client.js";
import { Guild } from "./Guild.js";
import { Member } from "./Member.js";
import { PermissionsBitField } from "./PermissionsBitField.js";

export class PartialGuild {
  id: string;
  client: Client;
  name: string;
  icon?: string;
  owner?: string;
  permissions: PermissionsBitField;
  features: string[];
  constructor(guild: any, client: Client) {
    this.client = client;
    this.id = guild.id;
    this.name = guild.name;
    this.icon = guild.icon;
    this.owner = guild.owner;
    this.permissions = new PermissionsBitField(guild.permissions);
    this.features = guild.features;
  }
  async fetchChannels(): Promise<Collection<string, Channel>> {
    const rest = this.client.rest;
    const channels = (await rest.get(Routes.guildChannels(this.id))) as any[];
    return channels.reduce(
      (coll: Collection<string, Channel>, channel) =>
        coll.set(channel.id, new Channel(channel, this.client)),
      new Collection<string, Channel>()
    );
  }
  async fetch(withCounts = true): Promise<Guild> {
    const apiGuild = await this.client.rest.get(
      `/guilds/${this.id}?with_counts=true`
    );

    const guild = new Guild(apiGuild, this.client);
    this.client.guilds.cache.set(guild.id, guild);
    this.client.emit("guildUpdate", this, guild);
    return guild;
  }
  get partial() {
    if (this instanceof PartialGuild) return true;
    return false;
  }
}
