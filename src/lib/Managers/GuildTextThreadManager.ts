import { Client } from "../Client.js";
import { GuildTextChannel } from "../GuildTextChannel.js";
import { ThreadChannel } from "../ThreadChannel.js";
import { Manager } from "./Manager.js";

export class GuildTextThreadManager extends Manager<string, ThreadChannel> {
  channelId: string;
  constructor(client: Client, channel: GuildTextChannel) {
    super(client);
    this.channelId = channel.id;
  }
  private _add(data: ThreadChannel) {
    this.cache.set(data.id, data);
  }
  get channel() {
    return (
      (this.client.channels.cache.get(this.channelId) as
        | GuildTextChannel
        | undefined) ?? null
    );
  }
}
