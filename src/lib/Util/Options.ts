import { ChannelType } from "discord-api-types/v10";
import { Role } from "../Role";
type BufferResolvable = string | Buffer;

export type BanOptions = {
  deleteMessageSeconds?: number;
  deleteMessageDays?: number;
  reason?: string;
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

export type EditMemberOptions = {
  nick?: string | null;
  roles?: Role[] | string[];
  mute?: boolean;
  deaf?: boolean | null;
  channelId?: string | null;
  communicationDisabledUntil?: Date | number | string | null;
};

export type EmojiFetchOptions = {
  id?: string;
  force?: boolean;
};

export type RoleFetchOptions = {
  id?: string;
  force?: boolean;
};

export type UserEditOptions = {
  username?: string;
  avatar?: BufferResolvable;
};
