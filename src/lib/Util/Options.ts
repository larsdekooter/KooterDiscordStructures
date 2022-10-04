import { ChannelType } from "discord-api-types/v10";

export type BanOptions = {
  deleteMessageSeconds?: number;
  deleteMessageDays?: number;
};

export type CreateChannelOptions = {
  name: string;
  type?: ChannelType;
  topic?: string;
  bitrate?: number;
  userLimit?: number;
  rateLimitPerUser?: number;
  position?: number;
  permissionOverwrites?: any[];
  parentId?: string;
  nsfw?: boolean;
  rtcRegion?: string;
  videoQualityMode?: number;
  defaultAutoArchiveDuration?: number;
};

export type RoleCreateOptions = {
  name?: string;
  permissions?: string;
  color?: number;
  hoist?: boolean;
  icon?: string;
  emoji?: string;
  mentionable?: boolean;
};

export type MessageFetchOptions = {
  limit?: number;
  before?: string;
  after?: string;
  around?: string;
};
