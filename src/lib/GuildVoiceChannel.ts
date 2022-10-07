import { PermissionFlagsBits } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { GuildChannel } from "./GuildChannel.js";

export class GuildVoiceChannel extends GuildChannel {
  bitrate: number;
  rtcRegion?: string;
  // declare type: ChannelType.GuildVoice;
  userLimit: number;
  constructor(data: any, client: Client) {
    super(data, client);
    this.bitrate = data.bitrate;
    this.rtcRegion = data.rtc_region;
    this.userLimit = data.user_limit;
  }
  get joinable() {
    return this.permissionsFor(this.guild?.members.me!)!.has(
      PermissionFlagsBits.Connect
    );
  }
}
