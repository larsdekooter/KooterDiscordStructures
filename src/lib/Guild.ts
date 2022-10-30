import { Collection } from "@discordjs/collection";
import {
  APIEmoji,
  APIGuild,
  APIGuildWelcomeScreen,
  Routes,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { Emoji } from "./Emoji.js";
import { GuildChannel } from "./GuildChannel.js";
import { GuildBanManager } from "./Managers/GuildBanManager.js";
import { GuildChannelManager } from "./Managers/GuildChannelManager.js";
import { GuildEmojiManager } from "./Managers/GuildEmojiManager.js";
import { GuildMemberManager } from "./Managers/GuildMemberManager.js";
import { GuildRoleManager } from "./Managers/GuildRoleManager.js";
import { PartialGuild } from "./PartialGuild.js";
import { Sticker } from "./Sticker.js";

export class Guild {
  id: string;
  name: string;
  roles: GuildRoleManager;
  client: Client;
  icon?: string;
  iconHash?: string;
  splash?: string;
  discoverySplash?: string;
  ownerId: string;
  afkTimeout: number;
  widgetEnabled?: boolean;
  widgetChannelId?: string;
  verificationLevel: number;
  defaultMessageNotifications: number;
  explicitContentFilter: string;
  #roles: any[];
  #emojis: APIEmoji[];
  // emojis: Collection<string, Emoji>;
  features: string[];
  mfaLevel: number;
  applicationId?: string;
  systemChannelId?: string;
  systemChannelFlags: number;
  rulesChannelId?: string;
  maxPresences?: number;
  maxMembers?: number;
  vanityUrlCode?: string;
  description: string;
  banner?: string;
  premiumTier: number;
  premiumSubscriberCount?: number;
  preferredLocale: string;
  publicUpdatesChannelId: string;
  maxVideoChannelUsers?: number;
  memberCount?: number;
  welcomeScreen: APIGuildWelcomeScreen;
  nsfwLevel: number;
  #stickers: any[];
  stickers = new Collection<string, Sticker>();
  premiumProgressBarEnabled: boolean;
  members: GuildMemberManager;
  afkChannelId?: string;
  channels: GuildChannelManager;
  bans: GuildBanManager;
  emojis: GuildEmojiManager;
  constructor(data: any, client: Client) {
    this.id = data.id;
    this.client = client;
    this.name = data.name;

    this.icon = data.icon;

    this.iconHash = data.icon_hash;

    this.splash = data.splash;

    this.discoverySplash = data.discovery_splash;

    this.ownerId = data.owner_id;

    this.afkChannelId = data.afk_channel_id;

    this.afkTimeout = data.afk_timout;

    this.widgetEnabled = data.widget_enabled;

    this.widgetChannelId = data.widget_channel_id;

    this.verificationLevel = data.verification_level;

    this.defaultMessageNotifications = data.default_message_notifications;

    this.explicitContentFilter = data.explicit_content_filter;

    this.#roles = data.roles;

    this.roles = new GuildRoleManager(this.client, this, this.#roles);

    this.#emojis = data.emojis;
    this.emojis = new GuildEmojiManager(this.client, this.id, this.#emojis);

    this.features = data.features;

    this.mfaLevel = data.mfa_level;

    this.applicationId = data.application_id;

    this.systemChannelId = data.system_channel_id;

    this.systemChannelFlags = data.system_channel_flags;

    this.rulesChannelId = data.rules_channel_id;

    this.maxPresences = data.max_presences;

    this.maxMembers = data.max_members;

    this.vanityUrlCode = data.vanity_url_code;

    this.description = data.description;

    this.banner = data.banner;

    this.premiumTier = data.premium_tier;
    this.premiumSubscriberCount = data.premium_subscriber_count;

    this.preferredLocale = data.preferredLocale;

    this.publicUpdatesChannelId = data.public_updates_channel_id;

    this.maxVideoChannelUsers = data.max_video_channel_users;

    this.memberCount = data.approximate_member_count;

    this.welcomeScreen = data.welcomeScreen;

    this.nsfwLevel = data.nsfw_level;

    this.#stickers = data.stickers;
    this.stickers = this.#stickers
      .map((sticker) => new Sticker(sticker, this.client))
      .reduce(
        (coll: Collection<string, Sticker>, st: Sticker) => coll.set(st.id, st),
        new Collection<string, Sticker>()
      );

    this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
    this.members = new GuildMemberManager(this.client, this);
    this.channels = new GuildChannelManager(this.client, this);
    this.bans = new GuildBanManager(this.client, this);
    this.client.channels.cache
      .filter((channel) => {
        if (channel instanceof GuildChannel) {
          return channel.guildId === this.id;
        }
        return false;
      })
      .forEach((channel) =>
        this.channels.cache.set(channel.id, channel as GuildChannel)
      );
  }
  static async build(id: string, client: Client): Promise<Guild> {
    const guild = (await client.rest.get(Routes.guild(id))) as APIGuild;
    return new this(guild, client);
  }
  get partial() {
    if (this instanceof PartialGuild) {
      return true;
    }
    return false;
  }
  fetchMe() {
    return this.members.fetch(this.client.id);
  }
  leave() {
    return this.client.user.leaveGuild(this.id);
  }
}
