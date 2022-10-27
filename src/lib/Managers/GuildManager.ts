import { Guild } from "../Guild.js";
import { Manager } from "./Manager.js";

export class GuildManager extends Manager<string, Guild> {
  async fetch(id: string, force = false): Promise<Guild | null> {
    if (force) {
      const guild = new Guild(
        await this.client.rest.get(`/guilds/${id}?with_counts=true`),
        this.client
      );
      this._add(guild);
      return guild;
    } else {
      if (this.cache.has(id)) return this.cache.get(id) ?? null;
      const guild = new Guild(
        await this.client.rest.get(`/guilds/${id}?with_counts=true`),
        this.client
      );
      this._add(guild);
      return guild;
    }
  }
  private _add(data: Guild) {
    this.cache.set(data.id, data);
  }
}
