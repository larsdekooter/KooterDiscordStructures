import { Collection } from "@discordjs/collection";
import { Channel } from "../Channel.js";
import { findChannelType } from "../Util/Channel.js";
import { Manager } from "./Manager.js";
import { PartialGuild } from "../PartialGuild.js";
import { Routes } from "discord-api-types/v10";
export class ChannelManager extends Manager<string, Channel> {
  async fetchAll(): Promise<Collection<string, Channel>> {
    return new Promise((resolve, reject) => {
      this.client.partialGuilds.forEach(async (guild: PartialGuild) => {
        const guildChannels = await guild.fetchChannels();
        guildChannels.forEach((channel) => {
          this.cache.set(channel.id, channel);
        });
        resolve(this.cache);
      });
    });
  }
  async fetch(id: string, force = false): Promise<Channel | null> {
    if (force && id) {
      const apiChannel = (await this.client.rest.get(
        Routes.channel(id)
      )) as any;
      const channel = findChannelType(apiChannel, this.client);
      this.client.emit(
        "channelUpdate",
        this.client.channels.cache.get(id),
        channel
      );
      this._add(channel);
      return channel;
    } else {
      if (this.cache.has(id)) return this.cache.get(id) ?? null;
      const apiChannel = (await this.client.rest.get(
        Routes.channel(id)
      )) as any;
      const channel = findChannelType(apiChannel, this.client);
      this.client.emit("channelUpdate", this.cache.get(id), channel);
      this._add(channel);
      return channel;
    }
  }
  private _add(channel: Channel) {
    this.cache.set(channel.id, channel);
    if (channel.inGuild()) {
      channel.guild?.channels.cache.set(channel.id, channel);
    }
  }
}
