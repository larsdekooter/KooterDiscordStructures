import { ChannelType } from "discord-api-types/v10";
import { GuildVoiceChannel } from "./GuildVoiceChannel.js";

export class StageChannel extends GuildVoiceChannel {
  declare type: ChannelType.GuildStageVoice;
}
