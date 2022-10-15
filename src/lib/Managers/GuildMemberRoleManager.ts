import { Collection } from "@discordjs/collection";
import { APIRole, Routes } from "discord-api-types/v10";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { Member } from "../Member.js";
import { Role } from "../Role.js";
import { RoleFetchOptions } from "../Util/Options.js";
import { Manager } from "./Manager.js";

export class GuildMemberRoleManager extends Manager<string, Role> {
  member: Member;
  guild: Guild;
  constructor(client: Client, member: Member) {
    super(client);
    this.cache = new Collection<string, Role>();
    this.member = member;
    this.guild = this.member.guild;
    this.guild.roles.cache
      .filter((role) => this.member._roles.includes(role.id))
      .reduce(
        (coll: Collection<string, Role>, role) => coll.set(role.id, role),
        this.cache
      );
  }
  set(roles: Role[] | string[]) {
    return this.member.edit({ roles });
  }
  get highest() {
    return this.cache.reduce(
      (prev, role) => (role.comparePositionsTo(prev) > 0 ? role : prev),
      this.cache.first()
    );
  }
  comparePositions(role1: Role, role2: Role) {
    if (role1.position === role2.position) {
      return Number(BigInt(role2.id) - BigInt(role1.id));
    }
    return role1.position - role2.position;
  }
  add(
    roleOrRoles: Role | Role[] | Collection<string, Role> | string[] | string
  ) {
    const roles = this.cache.map((role) => role.id);
    if (Array.isArray(roleOrRoles) || roleOrRoles instanceof Collection) {
      for (const role of roleOrRoles.values()) {
        roles.push(typeof role === "string" ? role : role.id);
      }
    } else {
      roles.push(
        typeof roleOrRoles === "string" ? roleOrRoles : roleOrRoles.id
      );
    }
    return this.set(roles);
  }
  remove(
    roleOrRoles: Role | Role[] | Collection<string, Role> | string[] | string
  ) {
    let roles = this.cache.toJSON();
    const roleIds: string[] = [];
    if (Array.isArray(roleOrRoles) || roleOrRoles instanceof Collection) {
      for (const role of roleOrRoles.values()) {
        roleIds.push(typeof role === "string" ? role : role.id);
      }
      roles = roles.filter((role) => !roleIds.includes(role.id));
    } else {
      let id = typeof roleOrRoles === "string" ? roleOrRoles : roleOrRoles.id;
      roles = roles.filter((role) => role.id !== id);
    }

    return this.set(roles);
  }
  private _add(data: Role) {
    this.cache.set(data.id, data);
  }
  async fetch({ id, force }: RoleFetchOptions) {
    if (id && force) {
      const role = new Role(
        await this.client.rest.get(Routes.guildRole(this.guild.id, id)),
        this.guild
      );
      this._add(role);
      return role;
    } else if (!id) {
      return (
        (await this.client.rest.get(
          Routes.guildRoles(this.guild.id)
        )) as APIRole[]
      )
        .map((role) => new Role(role, this.guild))
        .reduce((coll, dat) => coll.set(dat.id, dat), this.cache)
        .filter((role) => this.member._roles.includes(role.id));
    } else if (this.cache.get(id)) return this.cache.get(id) ?? null;
    else {
      const role = new Role(
        await this.client.rest.get(Routes.guildRole(this.guild.id, id)),
        this.guild
      );
      this._add(role);
      return role;
    }
  }
}
