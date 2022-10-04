import { Routes } from "discord-api-types/v10";
import { BanOptions } from "../Util/Options.js";
import { Guild } from "../Guild.js";
import { Manager } from "./Manager.js";
import { Client } from "../Client.js";

export class GuildBanManager extends Manager<string, any> {
  guild: Guild;
  constructor(client: Client, guild: Guild) {
    super(client);
    this.guild = guild;
  }
  async create(userId: string, options: BanOptions = {}) {
    return await this.client.rest.put(Routes.guildBan(this.guild.id, userId), {
      body: {
        delete_message_seconds:
          options.deleteMessageSeconds ??
          (options.deleteMessageDays
            ? options.deleteMessageDays * 24 * 60 * 60
            : undefined),
      },
    });
  }
  async remove(userId: string) {
    return await this.client.rest.delete(
      Routes.guildBan(this.guild.id, userId)
    );
  }
}
