import { CategoryChannel } from "../CategoryChannel.js";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { GuildChannel } from "../GuildChannel.js";
import { PartialGuild } from "../PartialGuild.js";
import { Manager } from "./Manager.js";

export class CategoryChannelChildManager extends Manager<string, GuildChannel> {
  guild: Guild | PartialGuild;
  channelId: string;
  constructor(client: Client, guild: Guild | PartialGuild, channelId: string) {
    super(client);
    this.guild = guild;
    this.channelId = channelId;
    this.guild.channels.cache
      .filter((channel) => channel.parentId === this.channelId)
      .forEach((channel) => this._add(channel));
  }
  private _add(data: GuildChannel) {
    this.cache.set(data.id, data);
    this.guild.channels.cache.set(data.id, data);
    this.client.channels.cache.set(data.id, data);
  }
  get channel() {
    return (
      (this.client.channels.cache.get(this.channelId) as
        | CategoryChannel
        | undefined) ?? null
    );
  }
}
