import { APIBan, Routes } from "discord-api-types/v10";
import { BanOptions } from "../Util/Options.js";
import { Guild } from "../Guild.js";
import { Manager } from "./Manager.js";
import { Client } from "../Client.js";
import { GuildBan } from "../Guildban.js";
import { Collection } from "@discordjs/collection";

export class GuildBanManager extends Manager<string, GuildBan> {
  guildId: string;
  constructor(client: Client, guildId: string) {
    super(client);
    this.guildId = guildId;
  }
  async create(userId: string, options: BanOptions = {}) {
    await this.client.rest.put(Routes.guildBan(this.guildId, userId), {
      body: {
        delete_message_seconds:
          options.deleteMessageSeconds ??
          (options.deleteMessageDays
            ? options.deleteMessageDays * 24 * 60 * 60
            : undefined),
      },
      reason: options.reason,
    });
    return (
      this.guild?.members.cache.get(userId) ??
      this.client.users.cache.get(userId) ??
      userId
    );
  }
  async remove(userId: string) {
    return await this.client.rest.delete(Routes.guildBan(this.guildId, userId));
  }
  async fetch<Id extends string | any>(
    id?: Id
  ): Promise<Id extends string ? GuildBan : Collection<string, GuildBan>> {
    if (id) {
      const apiBan = (await this.client.rest.get(
        Routes.guildBan(this.guildId, id as unknown as string)
      )) as APIBan;
      const ban = new GuildBan(apiBan, this.client, this.guildId);
      return ban as any;
    } else {
      const apiBans = (
        (await this.client.rest.get(Routes.guildBans(this.guildId))) as APIBan[]
      ).reduce(
        (coll, ban) =>
          coll.set(ban.user.id, new GuildBan(ban, this.client, this.guildId)),
        this.cache
      );
      return apiBans as any;
    }
  }
  get guild() {
    return this.client.guilds.cache.get(this.guildId) ?? null;
  }
}
