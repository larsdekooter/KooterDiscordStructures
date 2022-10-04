import { Routes } from "discord-api-types/v10";
import { RoleCreateOptions } from "../Util/Options.js";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { Role } from "../Role.js";
import { Manager } from "./Manager.js";

export class GuildRoleManager extends Manager<string, Role> {
  guild: Guild;
  constructor(client: Client, guild: Guild, roles: any[]) {
    super(client);
    this.guild = guild;
    roles
      .map((role) => new Role(role, guild))
      .reduce((coll, role) => {
        return coll.set(role.id, role);
      }, this.cache);
  }

  async create(options: RoleCreateOptions) {
    const resolvedOptions = {
      name: options.name,
      permissions: options.permissions,
      color: options.color,
      hoist: options.hoist,
      icon: options.icon,
      unicode_emoji: options.emoji,
      mentionable: options.mentionable,
    };
    const role = new Role(
      await this.client.rest.post(Routes.guildRoles(this.guild.id), {
        body: resolvedOptions,
      }),
      this.guild
    );
    this.guild.roles.cache.set(role.id, role);
    return role;
  }
}
