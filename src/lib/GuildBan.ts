import { APIBan } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { User } from "./User.js";

export class GuildBan {
  user: User;
  reason: string | null;
  client: Client;
  guildId: string;
  constructor(data: APIBan, client: Client, guildId: string) {
    this.user = new User(data.user, client);
    this.reason = data.reason;
    this.client = client;
    this.guildId = guildId;
  }
  get guild() {
    return this.client.guilds.cache.get(this.guildId) ?? null;
  }
  async fetch() {
    return (await this.guild?.bans.fetch(this.user.id)) ?? null;
  }
}
