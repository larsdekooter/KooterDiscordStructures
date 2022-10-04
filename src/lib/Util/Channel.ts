import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v10";
import { AttachmentBuilder } from "../AttachmentBuilder.js";
import { CategoryChannel } from "../CategoryChannel.js";
import { Channel } from "../Channel.js";
import { Client } from "../Client.js";
import { ForumChannel } from "../ForumChannel.js";
import { GuildTextChannel } from "../GuildTextChannel.js";
import { GuildVoiceChannel } from "../GuildVoiceChannel.js";
import { NewsChannel } from "../NewsChannel.js";
import { StageChannel } from "../StageChannel.js";
import { TextChannel } from "../TextChannel.js";
import { ThreadChannel } from "../ThreadChannel.js";
import { VoiceChannel } from "../VoiceChannel.js";
export type MessageOptions = {
  content?: string;
  tts?: boolean;
  embeds?: EmbedBuilder[] | Object[];
  components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[];
  files?: AttachmentBuilder[] | string[];
};

export function findChannelType(apiChannel: any, client: Client) {
  let channel: Channels;
  switch (apiChannel.type) {
    case ChannelType.GuildAnnouncement: {
      channel = new NewsChannel(apiChannel, client);
      break;
    }
    case ChannelType.GuildCategory: {
      channel = new CategoryChannel(apiChannel, client);
      break;
    }
    case ChannelType.GuildForum: {
      channel = new ForumChannel(apiChannel, client);
      break;
    }
    case ChannelType.GuildStageVoice: {
      channel = new StageChannel(apiChannel, client);
      break;
    }
    case ChannelType.GuildText: {
      channel = new TextChannel(apiChannel, client);
      break;
    }
    case ChannelType.GuildVoice: {
      channel = new VoiceChannel(apiChannel, client);
      break;
    }
    case ChannelType.PrivateThread || ChannelType.PublicThread: {
      channel = new ThreadChannel(apiChannel, client);
      break;
    }
    default: {
      channel = new Channel(apiChannel, client);
      break;
    }
  }
  return channel;
}

type Channels =
  | NewsChannel
  | CategoryChannel
  | ForumChannel
  | StageChannel
  | GuildTextChannel
  | GuildVoiceChannel
  | ThreadChannel
  | Channel;
