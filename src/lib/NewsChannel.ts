import { ChannelType, Routes } from "discord-api-types/v10";
import { GuildTextChannel } from "./GuildTextChannel.js";

export class NewsChannel extends GuildTextChannel {
  declare type: ChannelType.GuildAnnouncement;
  async addFollower(channel: GuildTextChannel) {
    await this.client.rest.post(Routes.channelFollowers(this.id), {
      body: { webhook_channel_id: channel.id },
    });
    return this;
  }
}
