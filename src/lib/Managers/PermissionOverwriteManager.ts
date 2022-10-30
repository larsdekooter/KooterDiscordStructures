import { Client } from "../Client.js";
import { GuildChannel } from "../GuildChannel.js";
import { PermissionOverwrites } from "../PermissionOverwrite.js";
import { Manager } from "./Manager.js";

export class PermissionOverwriteManager extends Manager<
  string,
  PermissionOverwrites
> {
  channelId: string;
  constructor(
    client: Client,
    overwrites: PermissionOverwrites[],
    channel: GuildChannel
  ) {
    super(client);
    overwrites.map((overwrite) =>
      this.cache.set(
        overwrite.id,
        new PermissionOverwrites(overwrite, channel, client)
      )
    );
    this.channelId = channel.id;
  }
  get channel() {
    return (
      (this.client.channels.cache.get(this.channelId) as
        | GuildChannel
        | undefined) ?? null
    );
  }
}
