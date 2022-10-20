import { APIBan, Routes } from "discord-api-types/v10";
import { BanOptions } from "../Util/Options.js";
import { Guild } from "../Guild.js";
import { Manager } from "./Manager.js";
import { Client } from "../Client.js";
import { GuildBan } from "../Guildban.js";
import { Collection } from "@discordjs/collection";

export class GuildBanManager extends Manager<string, GuildBan> {
  guild: Guild;
  constructor(client: Client, guild: Guild) {
    super(client);
    this.guild = guild;
  }
  async create(userId: string, options: BanOptions = {}) {
    await this.client.rest.put(Routes.guildBan(this.guild.id, userId), {
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
      this.guild.members.cache.get(userId) ??
      this.client.users.cache.get(userId) ??
      userId
    );
  }
  async remove(userId: string) {
    return await this.client.rest.delete(
      Routes.guildBan(this.guild.id, userId)
    );
  }
  async fetch<Id extends string | any>(
    id?: Id
  ): Promise<Id extends string ? GuildBan : Collection<string, GuildBan>> {
    if (id) {
      const apiBan = (await this.client.rest.get(
        Routes.guildBan(this.guild.id, id as unknown as string)
      )) as APIBan;
      const ban = new GuildBan(apiBan, this.client, this.guild.id);
      return ban as any;
    } else {
      const apiBans = (
        (await this.client.rest.get(
          Routes.guildBans(this.guild.id)
        )) as APIBan[]
      ).reduce(
        (coll, ban) =>
          coll.set(ban.user.id, new GuildBan(ban, this.client, this.guild.id)),
        this.cache
      );
      return apiBans as any;
    }
  }
}
