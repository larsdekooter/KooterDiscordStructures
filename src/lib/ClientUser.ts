import {
  APIUser,
  RESTGetAPICurrentUserResult,
  Routes,
  UserFlags,
  UserPremiumType,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { DataResolver } from "./DataResolver.js";
import { MessageOptions } from "./Util/Channel.js";
import { UserEditOptions } from "./Util/Options.js";

export class ClientUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean | null;
  system: boolean | null;
  mfaEnabled: boolean | null;
  banner: string | null;
  accentColor?: number | null;
  locale: string | null;
  verified?: boolean | null;
  flags: number | null;
  premiumType: UserPremiumType | null;
  publicFlags: UserFlags | null;
  client: Client;
  constructor(data: APIUser, client: Client) {
    this.client = client;
    this._patch(data);
  }
  get tag() {
    return `${this.username}#${this.discriminator}`;
  }
  avatarURL() {
    if (this.avatar) {
      return this.client.rest.cdn.avatar(this.id, this.avatar);
    }
    return null;
  }
  toString() {
    return `<@${this.id}>`;
  }
  createDM(force = false) {
    return this.client.users.createDM(this.id, force);
  }
  async send(options: MessageOptions) {
    const dm = await this.createDM();
    return await dm.send(options);
  }
  async fetch() {
    this._patch((await this.client.rest.get(Routes.user())) as APIUser);
    return this;
  }
  private _patch(data: RESTGetAPICurrentUserResult) {
    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.bot = data.bot ?? null;
    this.system = data.system ?? null;
    this.mfaEnabled = data.mfa_enabled ?? null;
    this.banner = data.banner ?? null;
    this.accentColor = data.accent_color ?? null;
    this.locale = data.locale ?? null;
    this.verified = data.verified ?? null;
    this.flags = data.flags ?? null;
    this.premiumType = data.premium_type ?? null;
    this.publicFlags = data.public_flags ?? null;
    return this;
  }
  async setUsername(username: string) {
    return this.edit({ username });
  }
  async edit(options: UserEditOptions) {
    if (typeof options.avatar !== "undefined")
      options.avatar =
        (await DataResolver.resolveImage(options.avatar)) ?? undefined;

    const data = (await this.client.rest.patch(Routes.user(), {
      body: options,
    })) as any;
    this.client.token = data.token;
    this.client.rest.setToken(data.token);
    return this._patch(data);
  }
  async leaveGuild(id: string) {
    await this.client.rest.delete(Routes.userGuild(id));
    return this;
  }
}
