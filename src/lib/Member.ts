import { PermissionFlagsBits, Routes } from "discord-api-types/v10";
import { BanOptions, EditMemberOptions } from "./Util/Options.js";
import { Client } from "./Client.js";
import { Guild } from "./Guild.js";
import { GuildMemberRoleManager } from "./Managers/GuildMemberRoleManager.js";
import { PermissionsBitField } from "./PermissionsBitField.js";
import { User } from "./User.js";
import { Role } from "./Role.js";

export class Member {
  id: string;
  user: User;
  guild: Guild;
  _roles: any[];
  nick?: string;
  avatar?: string;
  joinedAt: any;
  premiumSince: any;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  communicationDisabledUntil: any;
  client: Client;
  roles: GuildMemberRoleManager;
  constructor(data: any, guild: Guild) {
    this.user = new User(data.user, guild.client);
    this.id = this.user.id;

    this.nick = data.nick;

    this.avatar = data.avatar;

    this._roles = data.roles;

    this.joinedAt = new Date(data.joined_at);

    this.premiumSince = data.premium_since;

    this.deaf = data.deaf;

    this.mute = data.mute;

    this.pending = data.pending;

    this.communicationDisabledUntil = data.communication_disabled_until;
    this.guild = guild;
    this.client = this.guild.client;
    this.roles = new GuildMemberRoleManager(this.client, this, this.guild.id);
    this.roles.cache.set(
      this.guild.id,
      this.guild.roles.cache.get(this.guild.id) as Role
    );
  }
  toString(): `<@${string}>` {
    return `<@${this.id}>`;
  }
  edit(data: EditMemberOptions) {
    return this.guild.members.edit(this, data);
  }
  get permissions() {
    if (this.user.id === this.guild.ownerId)
      return new PermissionsBitField(PermissionsBitField.All).freeze();
    return new PermissionsBitField(
      this.roles.cache.map((role) => role.permissions)
    ).freeze();
  }
  ban(options: BanOptions = { deleteMessageDays: 7 }) {
    return this.guild.bans.create(this.id, options);
  }
  get manageable() {
    if (this.user.id === this.guild.ownerId) return false;
    if (this.user.id === this.client.user.id) return false;
    if (this.client.user.id === this.guild.ownerId) return true;
    return (
      this.guild.members.me!.roles.highest.comparePositionsTo(
        this.roles.highest
      ) > 0
    );
  }

  get bannable() {
    return (
      this.manageable &&
      this.guild.members.me!.permissions.has(PermissionFlagsBits.BanMembers)
    );
  }

  get kickable() {
    return (
      this.manageable &&
      this.guild.members.me!.permissions.has(PermissionFlagsBits.KickMembers)
    );
  }
  kick() {
    return this.guild.members.remove(this.id);
  }
}
