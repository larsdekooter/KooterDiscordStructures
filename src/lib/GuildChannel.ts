import { Collection } from "@discordjs/collection";
import { PermissionFlagsBits, Routes } from "discord-api-types/v10";
import { CategoryChannel } from "./CategoryChannel.js";
import { Channel } from "./Channel.js";
import { Client } from "./Client.js";
import { PermissionOverwriteManager } from "./Managers/PermissionOverwriteManager.js";
import { Member } from "./Member.js";
import { PermissionsBitField } from "./PermissionsBitField.js";
import { Role } from "./Role.js";

export class GuildChannel extends Channel {
  guildId: string;
  name: string;
  parentId: string | null;
  permissionOverwrites: PermissionOverwriteManager;
  permissionsLocked?: boolean;
  position: number;
  constructor(data: any, client: Client) {
    super(data, client);
    this.guildId = data.guild_id;
    this.name = data.name;
    this.permissionOverwrites = new PermissionOverwriteManager(
      data.permission_overwrites,
      data.permission_overwrites,
      this
    );
    this.permissionsLocked = data.permissions_locked;
    this.position = data.position;
    this.parentId = data.parent_id;
  }
  get guild() {
    return this.client.guilds.cache.get(this.guildId);
  }
  get partialGuild() {
    return this.client.partialGuilds.get(this.guildId);
  }
  get deleteable() {
    return this.guild?.members.me?.permissions.has(
      PermissionFlagsBits.ManageChannels
    );
  }
  get parent() {
    if (this.parentId) {
      return this.client.channels.cache.get(this.parentId) as CategoryChannel;
    }
    return null;
  }
  get manageable() {
    return this.guild?.members.me?.permissions.has(
      PermissionFlagsBits.ManageChannels
    );
  }
  get members() {
    return this.guild?.members.cache.filter((m) =>
      this.permissionsFor(m)!.has(PermissionFlagsBits.ViewChannel, false)
    );
  }
  async fetch() {
    return new GuildChannel(
      await this.client.rest.get(Routes.channel(this.id)),
      this.client
    );
  }

  permissionsFor(memberOrRole: Member | Role, checkAdmin = false) {
    const member = this.guild?.members.cache.get(memberOrRole.id);
    if (member) return this.memberPermissions(member, checkAdmin);
    const role = this.guild?.roles.cache.get(memberOrRole.id);
    return role && this.rolePermissions(role, checkAdmin);
  }
  overwritesFor(
    member: Member | undefined,
    verified = false,
    roles: Collection<string, Role> | null = null
  ) {
    if (!verified) member = this.guild?.members.cache.get(member!.id);
    roles ??= member!.roles.cache;

    const roleOverwrites = [];
    let memberOverwrites;
    let everyoneOverwrites;

    for (const overwrite of this.permissionOverwrites.cache.values()) {
      if (overwrite.id === this.guild?.id) {
        everyoneOverwrites = overwrite;
      } else if (roles.has(overwrite.id)) {
        roleOverwrites.push(overwrite);
      } else if (overwrite.id === member!.id) {
        memberOverwrites = overwrite;
      }
    }

    return {
      everyone: everyoneOverwrites,
      roles: roleOverwrites,
      member: memberOverwrites,
    };
  }
  memberPermissions(
    member: Member,
    checkAdmin = false
  ): Readonly<PermissionsBitField> {
    if (checkAdmin && member.id === this.guild?.ownerId) {
      return new PermissionsBitField(PermissionsBitField.All).freeze();
    }
    const roles = member.roles.cache;
    const permissions = new PermissionsBitField(
      roles.map((role) => role.permissions)
    );
    if (checkAdmin && permissions.has(PermissionFlagsBits.Administrator)) {
      return new PermissionsBitField(PermissionsBitField.All).freeze();
    }

    const overwrites = this.overwritesFor(member, true, roles);

    return permissions
      .remove(overwrites.everyone?.deny ?? PermissionsBitField.DefaultBit)
      .add(overwrites.everyone?.allow ?? PermissionsBitField.DefaultBit)
      .remove(
        overwrites.roles.length > 0
          ? overwrites.roles.map((role) => role.deny)
          : PermissionsBitField.DefaultBit
      )
      .add(
        overwrites.roles.length > 0
          ? overwrites.roles.map((role) => role.allow)
          : PermissionsBitField.DefaultBit
      )
      .remove(overwrites.member?.deny ?? PermissionsBitField.DefaultBit)
      .add(overwrites.member?.allow ?? PermissionsBitField.DefaultBit)
      .freeze();
  }
  rolePermissions(
    role: Role,
    checkAdmin = false
  ): Readonly<PermissionsBitField> {
    if (checkAdmin && role.permissions.has(PermissionFlagsBits.Administrator)) {
      return new PermissionsBitField(PermissionsBitField.All).freeze();
    }

    const everyoneOverwrites = this.permissionOverwrites.cache.get(
      this.guild!.id
    );
    const roleOverwrites = this.permissionOverwrites.cache.get(role.id);

    return role.permissions
      .remove(everyoneOverwrites?.deny ?? PermissionsBitField.DefaultBit)
      .add(everyoneOverwrites?.allow ?? PermissionsBitField.DefaultBit)
      .remove(roleOverwrites?.deny ?? PermissionsBitField.DefaultBit)
      .add(roleOverwrites?.allow ?? PermissionsBitField.DefaultBit)
      .freeze();
  }
}
