import {
  APIAutoModerationRule,
  AutoModerationActionType,
  AutoModerationRuleEventType,
  AutoModerationRuleKeywordPresetType,
  AutoModerationRuleTriggerType,
  Routes,
} from "discord-api-types/v10";
import { Channel } from "../Channel.js";
import { Client } from "../Client.js";
import { Role } from "../Role.js";
import { Manager } from "./Manager.js";

export class GuildAutoModRuleManager extends Manager<
  string,
  APIAutoModerationRule
> {
  guildId: string;
  constructor(guildId: string, client: Client) {
    super(client);
    this.guildId = guildId;
  }
  get guild() {
    return this.client.guilds.cache.get(this.guildId) ?? null;
  }
  async create(options: AutoModRuleCreateOptions) {
    const data: AutoModRuleCreateData = {
      name: options.name,
      event_type: options.eventType,
      trigger_type: options.triggerType,
      trigger_metadata: {
        keyword_filter: options.triggerMetadata?.keywordFilter,
        regex_patterns: options.triggerMetadata?.regexPatterns,
        presets: options.triggerMetadata?.presets,
        allow_list: options.triggerMetadata?.allowList,
        mention_total_limit: options.triggerMetadata?.mentionTotalLimit,
      },
      actions: options.actions.map((action) => ({
        type: action.type,
        metadata: {
          channel_id: action.metadata.channelId,
          duration_seconds: action.metadata.durationSeconds,
        },
      })),
      enabled: typeof options === "boolean" ? options : true,
      exempt_roles: options.exemptRoles?.map((role: string | Role) => {
        if (typeof role === "string") {
          return role;
        }
        return role.id;
      }),
      exempt_channels: options.exemptChannels?.map(
        (channel: Channel | string) => {
          if (typeof channel === "string") {
            return channel;
          }
          return channel.id;
        }
      ),
    };
    const response = (await this.client.rest.post(
      Routes.guildAutoModerationRules(this.guildId),
      {
        body: data,
      }
    )) as APIAutoModerationRule;
    this.cache.set(response.id, response);
    return response;
  }
  async fetch<T extends string | any>(
    id?: T,
    force = false
  ): Promise<
    T extends string ? APIAutoModerationRule : APIAutoModerationRule[]
  > {
    if (id && force) {
      return (await this.client.rest.get(
        Routes.guildAutoModerationRule(this.guildId, id as unknown as string)
      )) as any;
    }
    if (id && !force) {
      if (this.cache.has(id as unknown as string))
        return this.cache.get(id as unknown as string) as any;
      return (await this.fetch(id, true)) as any;
    }
    return (await this.client.rest.get(
      Routes.guildAutoModerationRules(this.guildId)
    )) as any;
  }
}

type AutoModRuleCreateData = {
  name: string;
  event_type: AutoModerationRuleEventType;
  trigger_type: AutoModerationRuleTriggerType;
  trigger_metadata: {
    keyword_filter?: string[];
    regex_patterns?: string[];
    presets?: AutoModerationRuleKeywordPresetType[];
    allow_list?: string[];
    mention_total_limit?: number;
  };
  actions: {
    type: AutoModerationActionType;
    metadata: {
      channel_id: string;
      duration_seconds: number;
    };
  }[];
  enabled?: boolean;
  exempt_roles?: string[];
  exempt_channels?: string[];
};

export type AutoModRuleCreateOptions = {
  name: string;
  eventType: AutoModerationRuleEventType;
  triggerType: AutoModerationRuleTriggerType;
  triggerMetadata?: AutoModerationRuleTriggerMetadata;
  actions: AutoModerationRuleActions[];
  enabled?: boolean;
  exemptRoles?: Role[] | string[];
  exemptChannels?: Channel[] | string[];
};

export type AutoModerationRuleTriggerMetadata = {
  keywordFilter: string[];
  regexPatterns: string[];
  presets: AutoModerationRuleKeywordPresetType[];
  allowList: string[];
  mentionTotalLimit: number;
};

export type AutoModerationRuleActions = {
  type: AutoModerationActionType;
  metadata: AutoModerationActionMetadata;
};
export type AutoModerationActionMetadata = {
  channelId: string;
  durationSeconds: number;
};
