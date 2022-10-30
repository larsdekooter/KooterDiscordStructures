import { DiscordSnowflake } from "@sapphire/snowflake";
import { ChannelType, Routes } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { GuildVoiceChannel } from "./GuildVoiceChannel.js";
import { ThreadChannel } from "./ThreadChannel.js";
import { GuildTextChannel } from "./GuildTextChannel.js";
import { GuildChannel } from "./GuildChannel.js";
import { DMChannel } from "./DMChannel.js";
const ThreadChannelTypes = [
  ChannelType.AnnouncementThread,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
];

export class Channel {
  client: Client;
  flags: number;
  id: string;
  type: ChannelType;
  partial: boolean;
  url: string;
  #data;
  constructor(data: any, client: Client) {
    this.client = client;
    this.flags = data.flags;
    this.id = data.id;
    this.type = data.type;
    this.partial = data.partial;
    this.url = data.url;
    this.#data = data;
  }
  get createdAt() {
    return new Date(this.createdTimestamp);
  }
  get createdTimestamp() {
    return DiscordSnowflake.timestampFrom(this.id);
  }
  async delete() {
    return this.client.rest.delete(Routes.channel(this.id));
  }
  isTextBased(): this is GuildTextChannel {
    return "messages" in this;
  }
  isVoiceBased(): this is GuildVoiceChannel {
    return "bitrate" in this;
  }
  isThread(): this is ThreadChannel {
    return ThreadChannelTypes.includes(this.type);
  }
  inGuild(): this is GuildChannel {
    return "guild_id" in this.#data;
  }
  toString(): `<#${string}>` {
    return `<#${this.id}>`;
  }
  isDMBased(): this is DMChannel {
    return [ChannelType.DM, ChannelType.GroupDM].includes(this.type);
  }
}
