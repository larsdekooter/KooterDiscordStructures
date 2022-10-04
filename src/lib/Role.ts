import { Guild } from "./Guild.js";
import { PermissionsBitField } from "./PermissionsBitField.js";

export class Role {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  icon?: string;
  emoji?: string;
  position: number;
  permissions: PermissionsBitField;
  managed: boolean;
  mentionable: boolean;
  _tags: any;
  constructor(data: any, guild: Guild) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
    this.hoist = data.hoist;
    this.icon = data.icon;
    this.emoji = data.unicode_emoji;
    this.position = data.position;
    this.permissions = new PermissionsBitField(
      BigInt(data.permissions)
    ).freeze();
    this.managed = data.managed;

    this.mentionable = data.mentionable;
    this._tags = data.tags;
  }
  comparePositionsTo(role: Role) {
    if (this.position === role.position) {
      return Number(BigInt(role.id) - BigInt(this.id));
    }
    return this.position - role.position;
  }
  toString(): `<@&${string}>` {
    return `<@&${this.id}>`;
  }
}
