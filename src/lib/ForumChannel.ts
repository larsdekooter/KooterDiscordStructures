import {
  APIGuildForumDefaultReactionEmoji,
  ChannelType,
  SortOrderType,
  ThreadAutoArchiveDuration,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { Emoji } from "./Emoji.js";
import { GuildChannel } from "./GuildChannel.js";
import { GuildForumThreadManager } from "./Managers/GuildForumThreadManager.js";
type GuildForumTag = {
  id: string;
  name: string;
  moderated: boolean;
  emoji?: Emoji;
};

export class ForumChannel extends GuildChannel {
  availableTags: GuildForumTag[];
  defaultAutoArchiveDuration?: ThreadAutoArchiveDuration;
  defaultReactionEmoji?: APIGuildForumDefaultReactionEmoji;
  defaultSortOrder?: SortOrderType;
  defaultThreadRateLimitPerUser: number;
  nsfw: boolean;
  rateLimitPerUser?: number;
  threads: GuildForumThreadManager;
  topic?: string;
  declare type: ChannelType.GuildForum;
  constructor(data: any, client: Client) {
    super(data, client);
    this.availableTags = data.available_tags;
    this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    this.defaultReactionEmoji = data.default_reaction_emoji;
    this.defaultSortOrder = data.default_sort_order;
    this.defaultThreadRateLimitPerUser =
      data.default_thread_rate_limit_per_user;
    this.nsfw = data.nsfw;
    this.rateLimitPerUser = data.rate_limit_per_user;
    this.topic = data.topic;
    this.threads = new GuildForumThreadManager(this.client, this);
  }
}
