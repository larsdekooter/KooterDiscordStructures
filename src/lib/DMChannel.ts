import {
  APIDMChannel,
  APIUser,
  ChannelType,
  Routes,
} from "discord-api-types/v10";
import { Channel } from "./Channel.js";
import { Client } from "./Client.js";
import { ChannelMessageManager } from "./Managers/ChannelMessageManager.js";
import { Message } from "./Message.js";
import { MessagePayload } from "./MessagePayload.js";
import { User } from "./User.js";
import { MessageCreateOptions } from "./Util/Channel.js";

export class DMChannel extends Channel {
  lastMessageId: string | null;
  messages: ChannelMessageManager;
  recipientId: string | null;
  #apiRecipient: APIUser;
  type = ChannelType.DM;
  constructor(data: APIDMChannel, client: Client) {
    super(data, client);
    this.lastMessageId = data.last_message_id ?? null;
    this.messages = new ChannelMessageManager(client, this.id);
    this.recipientId = data.recipients![0].id;
    this.#apiRecipient = data.recipients![0];
  }
  get lastMessage() {
    return this.messages.cache.get(this.lastMessageId as string) ?? null;
  }
  get recipient() {
    return this.client.users.cache.get(this.recipientId as string) ??
      this.#apiRecipient
      ? new User(this.#apiRecipient, this.client)
      : null;
  }
  async send(options: MessageCreateOptions) {
    const { body, files } = await new MessagePayload(options).resolveBody();

    const message = new Message(
      await this.client.rest.post(Routes.channelMessages(this.id), {
        body,
        files,
      }),
      this.client
    );
    this.messages.cache.set(message.id, message);
    return message;
  }
}
