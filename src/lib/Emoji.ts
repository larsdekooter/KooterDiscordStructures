import { Guild } from "./Guild.js";
import { User } from "./User.js";

export class Emoji {
  guild: Guild;
  id: string;
  name: string;
  #roles: string[];
  user: User;
  requireColons: boolean;
  managed: boolean;
  animated: boolean;
  available: boolean;
  constructor(data: any, guild: Guild) {
    this.guild = guild;
    this.id = data.id;
    this.name = data.name;
    this.#roles = data.roles;
    this.user = data.user;
    this.requireColons = data.require_colons;
    this.managed = data.managed;
    this.animated = data.animated;
    this.available = data.available;
  }
  get roles() {
    return this.guild.roles.cache.filter((role) =>
      this.#roles.includes(role.id)
    );
  }
}
