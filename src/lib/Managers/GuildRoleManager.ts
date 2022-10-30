import { Routes } from "discord-api-types/v10";
import { RoleCreateOptions } from "../Util/Options.js";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { Role } from "../Role.js";
import { Manager } from "./Manager.js";

export class GuildRoleManager extends Manager<string, Role> {
  guildId: string;
  constructor(client: Client, guild: Guild, roles: any[]) {
    super(client);
    this.guildId = guild.id;
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
      await this.client.rest.post(Routes.guildRoles(this.guildId), {
        body: resolvedOptions,
      }),
      this.guild!
    );
    this._add(role);
    return role;
  }
  private _add(data: Role) {
    this.cache.set(data.id, data);
  }
  get guild() {
    return this.client.guilds.cache.get(this.guildId) ?? null;
  }
}
