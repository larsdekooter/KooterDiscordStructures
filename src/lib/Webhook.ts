import { APIWebhook, Routes, WebhookType } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { PartialGuild } from "./PartialGuild.js";
import { User } from "./User.js";
import { Channel } from "./Channel.js";
import { MessageCreateOptions } from "./Util/Channel.js";
import { RawFile } from "@discordjs/rest";
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { AttachmentBuilder } from "./AttachmentBuilder.js";

type SendOptions = {
  content?: string;
  tts?: boolean;
  embeds?: EmbedBuilder[] | Object[];
  components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[];
  files?: AttachmentBuilder[] | string[];
  allowed_mentions?: {
    users?: [];
    roles?: [];
    channels?: [];
    replied_user?: boolean;
  };
};
export class Webhook {
  client: Client;
  id: string;
  type: WebhookType;
  guildId?: string;
  channelId: string;
  user?: User;
  name: string | null;
  avatar: string | null;
  token?: string;
  applicationId: string | null;
  sourceGuild: PartialGuild | null;
  sourceChannel: Channel | null;
  url?: string;
  constructor(data: APIWebhook, client: Client) {
    this.client = client;
    this.id = data.id;
    this.type = data.type;
    this.guildId = data.guild_id;
    this.channelId = data.channel_id;
    this.user = new User(data.user, this.client);
    this.name = data.name;
    this.avatar = data.avatar;
    this.token = data.token;
    this.applicationId = data.application_id;
    this.sourceGuild = data.source_guild
      ? new PartialGuild(data.source_guild, this.client)
      : null;
    this.sourceChannel = data.source_guild
      ? new Channel(data.source_channel, this.client)
      : null;
  }
  async send(options: MessageCreateOptions) {
    let sendOptions: SendOptions;
    sendOptions = typeof options === "string" ? { content: options } : options;

    const files = options.files?.map((file) => {
      if (typeof file !== "string") {
        return {
          data: file.attachment,
          name: file.name,
          description: file.description,
        } as RawFile;
      } else {
        return {
          data: file,
        } as RawFile;
      }
    });
    sendOptions.allowed_mentions = {
      users: options.allowedMentions?.users,
      roles: options.allowedMentions?.roles,
      channels: options.allowedMentions?.channels,
      replied_user: options.allowedMentions?.repliedUser,
    };
    return await this.client.rest.post(Routes.webhook(this.id, this.token), {
      body: sendOptions,
      files,
    });
  }
}
