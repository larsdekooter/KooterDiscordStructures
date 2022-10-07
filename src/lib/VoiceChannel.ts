import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { Collection } from "@discordjs/collection";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { ChannelType, Routes, VideoQualityMode } from "discord-api-types/v10";
import { AttachmentBuilder } from "./AttachmentBuilder.js";
import { Client } from "./Client.js";
import { Collector } from "./Collector.js";
import { GuildVoiceChannel } from "./GuildVoiceChannel.js";
import { ChannelMessageManager } from "./Managers/ChannelMessageManager.js";
import { Message } from "./Message.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { CollectorOptions } from "./Util/CollectorOptions.js";

export class VoiceChannel extends GuildVoiceChannel {
  messages: ChannelMessageManager;
  nsfw: boolean;
  videoQualityMode?: VideoQualityMode;
  lastMessageId?: string;
  rateLimitPerUser?: number;
  declare type: ChannelType.GuildVoice;
  constructor(data: any, client: Client) {
    super(data, client);
    this.messages = new ChannelMessageManager(this.client, this);
    this.nsfw = data.nsfw;
    this.videoQualityMode = data.video_quality_mode;
    this.lastMessageId = data.last_message_id;
    this.rateLimitPerUser = data.rate_limit_per_user;
  }
  awaitMessageComponents(options: CollectorOptions) {
    return new Promise<Collection<string, MessageComponentInteraction>>(
      (resolve, reject) => {
        const collector = this.createMessageComponentCollector(options);

        collector.on("end", (collected, reason) => {
          if (reason === "TIME_END") {
            resolve(collected);
          } else reject(reason);
        });
      }
    );
  }
  createMessageComponentCollector(options: CollectorOptions) {
    return new Collector(options, this.client, { channel: this });
  }
  async bulkDelete(
    messages: number | Collection<string, Message> | Message[] | string[],
    filterOld = true
  ): Promise<Collection<string, Message | undefined> | string> {
    if (Array.isArray(messages) || messages instanceof Collection) {
      let messageIds: string[] =
        messages instanceof Collection
          ? [...messages.keys()]
          : messages.map((m) => (typeof m === "string" ? m : m.id));
      if (filterOld) {
        messageIds = messageIds.filter(
          (id) =>
            Date.now() - DiscordSnowflake.timestampFrom(id) < 1_209_600_000
        );
      }
      await this.client.rest.post(Routes.channelBulkDelete(this.id), {
        body: { messages: messageIds },
      });
      return messageIds.reduce(
        (coll, id) => coll.set(id, this.messages.cache.get(id)),
        new Collection<string, Message | undefined>()
      );
    }
    if (!isNaN(messages)) {
      if (messages < 2 || messages > 100) {
        console.log(
          "DiscordAPIError[50016]: Provided too few or too many messages to delete. Must provide at least 2 and at most 100 messages to delete."
        );
        return "DiscordAPIError[50016]: Provided too few or too many messages to delete. Must provide at least 2 and at most 100 messages to delete.";
      }
      const msgs = (await this.messages.fetch({
        limit: messages,
      })) as Collection<string, Message>;
      if (msgs.size < 2) {
        console.log(
          "DiscordAPIError[50016]: Provided too few or too many messages to delete. Must provide at least 2 and at most 100 messages to delete."
        );
        return "DiscordAPIError[50016]: Provided too few or too many messages to delete. Must provide at least 2 and at most 100 messages to delete.";
      }
      return await this.bulkDelete(msgs, filterOld);
    } else
      throw new Error(
        `Invalid messages parameter. Expected: number | Collection<string, Message> | Message[] | string[], recieved: ${messages}`
      );
  }
  async send(options: MessageOptions | string) {
    options =
      typeof options === "string" ? (options = { content: options }) : options;
    const message = new Message(
      await this.client.rest.post(Routes.channelMessages(this.id), {
        body: options,
      }),
      this.client
    );
    this.messages.cache.set(message.id, message);
    return message;
  }
}

type MessageOptions = {
  content?: string;
  tts?: boolean;
  embeds?: EmbedBuilder[] | Object[];
  components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[];
  files?: AttachmentBuilder[] | string[];
};
