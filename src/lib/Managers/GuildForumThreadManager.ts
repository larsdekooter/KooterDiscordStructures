import { Client } from "../Client.js";
import { ForumChannel } from "../ForumChannel.js";
import { ThreadChannel } from "../ThreadChannel.js";
import { Manager } from "./Manager.js";

export class GuildForumThreadManager extends Manager<string, ThreadChannel> {
  channel: ForumChannel;
  constructor(client: Client, channel: ForumChannel) {
    super(client);
    this.channel = channel;
  }
  private _add(data: ThreadChannel) {
    this.cache.set(data.id, data);
  }
}
