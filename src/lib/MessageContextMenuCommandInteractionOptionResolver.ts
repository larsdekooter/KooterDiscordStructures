import { APIMessage } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { Message } from "./Message.js";

export type MessageContextMenuCommandInteractionDataOptions = {
  messages: {
    [key: string]: APIMessage;
  };
};

export class MessageContextMenuCommandInteractionOptionResolver {
  options: MessageContextMenuCommandInteractionDataOptions;
  targetId: string;
  client: Client;
  constructor(
    options: MessageContextMenuCommandInteractionDataOptions,
    targetId: string,
    client: Client
  ) {
    this.options = options;
    this.targetId = targetId;
    this.client = client;
  }
  getMessage() {
    return new Message(this.options.messages[this.targetId], this.client);
  }
  get message() {
    return new Message(this.options.messages[this.targetId], this.client);
  }
}
