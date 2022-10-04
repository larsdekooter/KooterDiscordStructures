import { Collection } from "@discordjs/collection";
import { makeURLSearchParams } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { MessageFetchOptions } from "../Util/Options.js";
import { Channel } from "../Channel.js";
import { Client } from "../Client.js";
import { Message } from "../Message.js";
import { Manager } from "./Manager.js";
import { GuildTextChannel } from "../GuildTextChannel.js";
import { ThreadChannel } from "../ThreadChannel.js";
import { VoiceChannel } from "../VoiceChannel.js";

export class ChannelMessageManager extends Manager<string, Message> {
  channel: GuildTextChannel | ThreadChannel | VoiceChannel;
  constructor(
    client: Client,
    channel: GuildTextChannel | ThreadChannel | VoiceChannel
  ) {
    super(client);
    this.cache = new Collection<string, Message>();
    this.channel = channel;
  }
  async fetch(
    options?: MessageFetchOptions | string | Message
  ): Promise<Message | Collection<string, Message>> {
    if (typeof options === "string") {
      const message = new Message(
        await this.client.rest.get(
          Routes.channelMessage(this.channel.id, options)
        ),
        this.client
      );
      this.cache.set(message.id, message);
      if (this.channel.inGuild() && this.channel.isTextBased()) {
        this.channel.messages.cache.set(message.id, message);
      }
      return message;
    }
    if (options instanceof Message) {
      const message = new Message(
        await this.client.rest.get(
          Routes.channelMessage(this.channel.id, options.id)
        ),
        this.client
      );
      this.cache.set(message.id, message);
      if (this.channel.inGuild() && this.channel.isTextBased()) {
        this.channel.messages.cache.set(message.id, message);
      }
      return message;
    } else {
      const messages = (
        (await this.client.rest.get(Routes.channelMessages(this.channel.id), {
          query: makeURLSearchParams(options),
        })) as any[]
      )
        .map((message) => new Message(message, this.client))
        .reduce((coll, message) => coll.set(message.id, message), this.cache);
      messages.forEach((message) => {
        if (message.channel?.inGuild() && message.channel.isTextBased()) {
          message.channel?.messages.cache.set(message.id, message);
        }
      });
      return messages;
    }
  }
}
