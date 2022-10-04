import { CategoryChannel } from "../CategoryChannel.js";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { GuildChannel } from "../GuildChannel.js";
import { Manager } from "./Manager.js";

export class CategoryChannelChildManager extends Manager<string, GuildChannel> {
  guild: Guild;
  channel: CategoryChannel;
  constructor(client: Client, guild: Guild, channel: CategoryChannel) {
    super(client);
    this.guild = guild;
    this.channel = channel;
    this.guild.channels.cache
      .filter((channel) => channel.parentId === this.channel.id)
      .forEach((channel) => this.cache.set(channel.id, channel));
  }
}
