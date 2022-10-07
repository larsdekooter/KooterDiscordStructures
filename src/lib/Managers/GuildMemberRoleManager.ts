import { Collection } from "@discordjs/collection";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { Member } from "../Member.js";
import { Role } from "../Role.js";
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
  set(roles: Role[]) {
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
  add(roleOrRoles: Role | Role[] | Collection<string, Role>) {
    const roles = this.cache.toJSON();
    if (Array.isArray(roleOrRoles) || roleOrRoles instanceof Collection) {
      for (const role of roleOrRoles.values()) {
        roles.push(role);
      }
    } else {
      roles.push(roleOrRoles);
    }
    return this.set(roles);
  }
  remove(roleOrRoles: Role | Role[] | Collection<string, Role>) {
    let roles = this.cache.toJSON();
    const roleIds: string[] = [];
    if (Array.isArray(roleOrRoles) || roleOrRoles instanceof Collection) {
      for (const role of roleOrRoles.values()) {
        roleIds.push(role.id);
      }
      roles = roles.filter((role) => !roleIds.includes(role.id));
    } else {
      roles = roles.filter((role) => role.id !== roleOrRoles.id);
    }

    return this.set(roles);
  }
  private _add(data: Role) {
    this.cache.set(data.id, data);
  }
}
