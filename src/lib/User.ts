import { UserPremiumType } from "discord-api-types/v10";
import { Client } from "./Client.js";

export class User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  system?: boolean;
  mfaEnabled: boolean;
  banner?: string;
  accentColor?: number;
  locale?: string;
  verified?: boolean;
  flags?: number;
  premiumType?: UserPremiumType;
  publicFlags?: number;
  client: Client;
  constructor(data: any, client: Client) {
    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.bot = data.bot;
    this.system = data.system;
    this.mfaEnabled = data.mfa_enabled;
    this.banner = data.banner;
    this.accentColor = data.accent_color;
    this.locale = data.locale;
    this.verified = data.verified;
    this.flags = data.flags;
    this.premiumType = data.premiumType;
    this.publicFlags = data.public_flags;
    this.client = client;
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
}
