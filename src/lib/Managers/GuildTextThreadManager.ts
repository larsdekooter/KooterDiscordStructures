import { Client } from "../Client.js";
import { GuildTextChannel } from "../GuildTextChannel.js";
import { ThreadChannel } from "../ThreadChannel.js";
import { Manager } from "./Manager.js";

export class GuildTextThreadManager extends Manager<string, ThreadChannel> {
  channel: GuildTextChannel;
  constructor(client: Client, channel: GuildTextChannel) {
    super(client);
    this.channel = channel;
  }
}
