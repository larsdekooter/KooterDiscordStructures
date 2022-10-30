import { Collection } from "@discordjs/collection";
import { makeURLSearchParams } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { MessageFetchOptions } from "../Util/Options.js";
import { Client } from "../Client.js";
import { Message } from "../Message.js";
import { Manager } from "./Manager.js";
import { GuildTextChannel } from "../GuildTextChannel.js";
import { ThreadChannel } from "../ThreadChannel.js";
import { VoiceChannel } from "../VoiceChannel.js";
import { DMChannel } from "../DMChannel.js";
import { MessageOptions } from "../Util/Channel.js";
import { MessagePayload } from "../MessagePayload.js";

export class ChannelMessageManager extends Manager<string, Message> {
  channelId: string;
  constructor(client: Client, channelId: string) {
    super(client);
    this.cache = new Collection<string, Message>();
    this.channelId = channelId;
  }
  async fetch(
    options?: MessageFetchOptions | string | Message
  ): Promise<Message | Collection<string, Message>> {
    if (typeof options === "string") {
      const message = new Message(
        await this.client.rest.get(
          Routes.channelMessage(this.channelId, options)
        ),
        this.client
      );
      this._add(message);
      if (this.channel!.inGuild() && this.channel.isTextBased()) {
        this.channel.messages._add(message);
      }
      return message;
    }
    if (options instanceof Message) {
      const message = new Message(
        await this.client.rest.get(
          Routes.channelMessage(this.channelId, options.id)
        ),
        this.client
      );
      this._add(message);
      if (this.channel!.inGuild() && this.channel.isTextBased()) {
        this.channel.messages._add(message);
      }
      return message;
    } else {
      const messages = (
        (await this.client.rest.get(Routes.channelMessages(this.channelId), {
          query: makeURLSearchParams(options),
        })) as any[]
      )
        .map((message) => new Message(message, this.client))
        .reduce((coll, message) => coll.set(message.id, message), this.cache);
      messages.forEach((message) => {
        if (message.channel?.inGuild() && message.channel.isTextBased()) {
          message.channel?.messages._add(message);
        }
      });
      return messages;
    }
  }
  private _add(data: Message) {
    this.cache.set(data.id, data);
  }
  async edit(id: string, options: MessageOptions | string) {
    const { body, files } = await new MessagePayload(options).resolveBody();
    const message = new Message(
      await this.client.rest.patch(Routes.channelMessage(this.channelId, id), {
        body,
        files,
      }),
      this.client
    );
    this._add(message);
    return message;
  }
  get channel() {
    return (
      (this.client.channels.cache.get(this.channelId) as
        | GuildTextChannel
        | ThreadChannel
        | VoiceChannel
        | DMChannel
        | undefined) ?? null
    );
  }
}
