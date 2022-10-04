import { ChannelType } from "discord-api-types/v10";
import { GuildTextChannel } from "./GuildTextChannel.js";

export class TextChannel extends GuildTextChannel {
  declare type: ChannelType.GuildText;
}
