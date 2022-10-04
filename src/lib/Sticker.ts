import { StickerFormatType, StickerType } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { User } from "./User.js";

export class Sticker {
  id: string;
  packId?: string;
  name: string;
  description?: string;
  tags: string;
  asset?: string;
  type: StickerType;
  formatType: StickerFormatType;
  available: boolean;
  guildId?: string;
  user: User;
  sortValue?: number;
  client: Client;
  constructor(data: any, client: Client) {
    this.client = client;
    this.id = data.id;

    this.packId = data.pack_id;

    this.name = data.name;

    this.description = data.description;

    this.tags = data.tags;

    this.asset = data.asset;

    this.type = data.type;

    this.formatType = data.format_type;

    this.available = data.available;

    this.guildId = data.guild_id;

    this.user = new User(data.user, this.client);

    this.sortValue = data.sort_value;
  }
}
