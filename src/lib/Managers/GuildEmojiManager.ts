import { Collection } from "@discordjs/collection";
import { APIEmoji, Routes } from "discord-api-types/v10.js";
import { Client } from "../Client.js";
import { Emoji } from "../Emoji.js";
import { Guild } from "../Guild.js";
import { EmojiFetchOptions } from "../Util/Options.js";
import { Manager } from "./Manager.js";

export class GuildEmojiManager extends Manager<string, Emoji> {
  guildId: string;
  constructor(client: Client, guildId: string, guildEmojis: any) {
    super(client);
    this.guildId = guildId;
    (guildEmojis as APIEmoji[])
      .map((emoji) => new Emoji(emoji, this.guild as Guild))
      .reduce((coll, em) => coll.set(em.id, em), this.cache);
  }
  get guild() {
    return this.client.guilds.cache.get(this.guildId) ?? null;
  }
  async fetch({
    force,
    id,
  }: EmojiFetchOptions): Promise<Collection<string, Emoji> | Emoji> {
    if (force && id) {
      const apiEmoji = await this.client.rest.get(
        Routes.guildEmoji(this.guildId, id)
      );
      const emoji = new Emoji(apiEmoji, this.guild as Guild);
      this._add(emoji);
    } else if (!id) {
      const emojis = (
        (await this.client.rest.get(
          Routes.guildEmojis(this.guildId)
        )) as APIEmoji[]
      )
        .map((emoji) => new Emoji(emoji, this.guild as Guild))
        .reduce((coll, emoji) => coll.set(emoji.id, emoji), this.cache);
      return emojis;
    }
    const emoji = this.cache.get(id);
    if (emoji) return emoji;
    else return this.fetch({ force: true, id });
  }
  private _add(data: Emoji) {
    return this.cache.set(data.id, data);
  }
}
