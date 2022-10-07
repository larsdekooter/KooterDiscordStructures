import { Collection } from "@discordjs/collection";
import { APIChannel, Routes } from "discord-api-types/v10";
import { CreateChannelOptions } from "../Util/Options.js";
import { Channel } from "../Channel.js";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { Manager } from "./Manager.js";
import { GuildChannel } from "../GuildChannel.js";
import { findChannelType } from "../Util/Channel.js";

export class GuildChannelManager extends Manager<string, GuildChannel> {
  guild: Guild;
  constructor(client: Client, guild: Guild) {
    super(client);
    this.guild = guild;
  }
  async fetch(id?: string, force = false) {
    if (id && force) {
      const channel = new GuildChannel(
        await this.client.rest.get(Routes.channel(id)),
        this.client
      );
      if (channel.guildId !== this.guild.id) return null;
      this.client.emit(
        "channelUpdate",
        this.client.channels.cache.get(id),
        channel
      );
      this.cache.set(channel.id, channel);
      this.client.channels.cache.set(channel.id, channel);
      return channel;
    } else if (!id && force) {
      const channels = (
        (await this.client.rest.get(
          Routes.guildChannels(this.guild.id)
        )) as APIChannel[]
      ).reduce(
        (coll: Collection<string, Channel>, channel) =>
          coll.set(channel.id, new GuildChannel(channel, this.client)),
        this.cache
      );
      channels.forEach((channel) => {
        this.client.emit(
          "channelUpdate",
          this.client.channels.cache.get(channel.id),
          channel
        );
        this.client.channels.cache.set(channel.id, channel);
      });
      return channels;
    } else if (id && !force) {
      if (this.cache.has(id)) return this.cache.get(id);
      const channel = new GuildChannel(
        await this.client.rest.get(Routes.channel(id)),
        this.client
      );
      this.cache.set(channel.id, channel);
      this.client.emit(
        "channelUpdate",
        this.client.channels.cache.get(id),
        channel
      );
      this.client.channels.cache.set(channel.id, channel);
      return channel;
    } else if (!id && !force) {
      return this.cache;
    }
  }
  async create(options: CreateChannelOptions = { name: "" }) {
    const channel = new GuildChannel(
      await this.client.rest.post(Routes.guildChannels(this.guild.id), {
        body: options,
      }),
      this.client
    );

    this.cache.set(channel.id, channel);
    this.client.channels.cache.set(channel.id, channel);
    return channel;
  }
  async delete(channelId: string) {
    const apichannel =
      (await this.client.rest.delete(Routes.channel(channelId)), this.client);
    const channel = findChannelType(apichannel, this.client);
    return channel;
  }
  private _add(data: GuildChannel) {
    this.cache.set(data.id, data);
    this.client.channels.cache.set(data.id, data);
  }
}
