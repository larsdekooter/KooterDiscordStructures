import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { ImageURLOptions } from "@discordjs/rest";
import { UserPremiumType } from "discord-api-types/v10";
import { AttachmentBuilder } from "./AttachmentBuilder.js";
import { Client } from "./Client.js";
import { Message } from "./Message.js";
import { MessagePayload } from "./MessagePayload.js";
import { MessageCreateOptions } from "./Util/Channel.js";

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
  avatarURL(options: ImageURLOptions) {
    if (this.avatar) {
      return this.client.rest.cdn.avatar(this.id, this.avatar, options);
    }
    return null;
  }
  toString() {
    return `<@${this.id}>`;
  }
  createDM(force = false) {
    return this.client.users.createDM(this.id, force);
  }
  async send(options: MessageCreateOptions) {
    const dm = await this.createDM();
    return await dm.send(options);
  }
  displayAvatarURL(options: ImageURLOptions) {
    return this.avatarURL(options) ?? this.defaultAvatarURL;
  }
  get defaultAvatarURL() {
    return this.client.rest.cdn.defaultAvatar(
      (this.discriminator as unknown as number) % 5
    );
  }
}
