import { Collection } from "@discordjs/collection";
import {
  APIGuildTextChannel,
  ChannelType,
  Routes,
  ThreadAutoArchiveDuration,
} from "discord-api-types/v10";
import { Collector } from "./Collector.js";
import { GuildChannel } from "./GuildChannel.js";
import { ChannelMessageManager } from "./Managers/ChannelMessageManager.js";
import { GuildTextThreadManager } from "./Managers/GuildTextThreadManager.js";
import { Message } from "./Message.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { CollectorOptions } from "./Util/CollectorOptions.js";
import { DiscordSnowflake } from "@sapphire/snowflake";
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { AttachmentBuilder } from "./AttachmentBuilder";
import { Client } from "./Client.js";
import { ChannelWebhookManager } from "./Managers/ChannelWebhookManager.js";

export class GuildTextChannel extends GuildChannel {
  defaultAutoArchiveDuration: ThreadAutoArchiveDuration;
  lastMessageId?: string;
  messages: ChannelMessageManager;
  lastPinTimestamp?: string;
  nsfw: boolean;
  threads: GuildTextThreadManager;
  topic?: string;
  webhooks: ChannelWebhookManager;
  constructor(data: any, client: Client) {
    super(data, client);
    this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    this.lastMessageId = data.last_message_id;
    this.messages = new ChannelMessageManager(this.client, this);
    this.lastPinTimestamp = data.last_pin_timestamp;
    this.nsfw = data.nsfw;
    this.threads = new GuildTextThreadManager(this.client, this);
    this.topic = data.topic;
    this.webhooks = new ChannelWebhookManager(this.client, this);
  }
  get lastPinAt() {
    if (this.lastPinTimestamp) {
      return new Date(this.lastPinTimestamp);
    }
    return null;
  }
  get lastMessage() {
    if (!this.lastMessageId) return null;
    return this.messages.cache.get(this.lastMessageId);
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
    } else {
      throw new Error(
        `Invalid messages parameter. Expected: number | Collection<string, Message> | Message[] | string[], recieved: ${messages}`
      );
    }
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
