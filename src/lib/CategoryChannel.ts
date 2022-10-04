import { ChannelType } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { GuildChannel } from "./GuildChannel.js";
import { CategoryChannelChildManager } from "./Managers/CategoryChannelChildManager.js";

export class CategoryChannel extends GuildChannel {
  children: CategoryChannelChildManager;
  declare type: ChannelType.GuildCategory;
  constructor(data: any, client: Client) {
    super(data, client);
    this.children = new CategoryChannelChildManager(
      this.client,
      this.guild ?? this.partialGuild ?? ({} as any),
      this
    );
  }
}
