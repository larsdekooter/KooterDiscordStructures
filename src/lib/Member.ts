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
  guildId: string;
  constructor(data: any, guildId: string, client: Client) {
    this.user = new User(data.user, client);
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
    this.guildId = guildId;
    this.client = client;
    this.roles = new GuildMemberRoleManager(this.client, this, this.guildId);
    this.roles.cache.set(
      this.guildId,
      this.guild?.roles.cache.get(this.guildId) as Role
    );
  }
  toString(): `<@${string}>` {
    return `<@${this.id}>`;
  }
  get guild() {
    return this.client.guilds.cache.get(this.guildId) ?? null;
  }
  edit(data: EditMemberOptions) {
    return this.guild?.members.edit(this, data);
  }
  get permissions() {
    if (this.user.id === this.guild?.ownerId)
      return new PermissionsBitField(PermissionsBitField.All).freeze();
    return new PermissionsBitField(
      this.roles.cache.map((role) => role.permissions)
    ).freeze();
  }
  ban(options: BanOptions = { deleteMessageDays: 7 }) {
    return this.guild?.bans.create(this.id, options);
  }
  get manageable() {
    if (this.user.id === this.guild?.ownerId) return false;
    if (this.user.id === this.client.user.id) return false;
    if (this.client.user.id === this.guild?.ownerId) return true;
    return (
      this.guild!.members?.me!.roles?.highest?.comparePositionsTo(
        this.roles.highest
      ) > 0
    );
  }

  get bannable() {
    return (
      this.manageable &&
      this.guild?.members.me!.permissions.has(PermissionFlagsBits.BanMembers)
    );
  }

  get kickable() {
    return (
      this.manageable &&
      this.guild?.members.me!.permissions.has(PermissionFlagsBits.KickMembers)
    );
  }
  kick() {
    return this.guild?.members.remove(this.id);
  }
}
