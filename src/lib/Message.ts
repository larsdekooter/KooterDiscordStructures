import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { Collection } from "@discordjs/collection";
import { APIMessage, ComponentType, Routes } from "discord-api-types/v10";
import { CollectorOptions } from "./Util/CollectorOptions.js";
import { Channel } from "./Channel.js";
import { Client } from "./Client.js";
import { Collector } from "./Collector.js";
import { Embed } from "./Embed.js";
import { MessageInteraction } from "./MessageInteraction.js";
import { Role } from "./Role.js";
import { Sticker } from "./Sticker.js";
import { User } from "./User.js";
import { AttachmentBuilder } from "./AttachmentBuilder.js";
import { ThreadChannel } from "./ThreadChannel.js";
import { findChannelType } from "./Util/Channel.js";
import { Guild } from "./Guild.js";

export class Message {
  id: string;
  channelId: string;
  author: User;
  content: string;
  timestamp: any;
  editedTimestamp: string;
  tts: boolean;
  mentionEveryone: boolean;
  mentions: User[];
  mentionedRoles: Role[];
  mentionedChannels?: Channel[] | null;
  attachments: Object[];
  embeds: Embed[];
  reactions: any[];
  nonce: Number | String;
  pinned: boolean;
  webhookId?: string;
  type: number;
  activity: any;
  application: any;
  applicationId: string;
  messageReference?: Object;
  flags?: number;
  referencedMessage: Message | null;
  thread: Channel | null;
  components: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[];
  stickers?: Sticker[];
  client: Client;
  interaction?: MessageInteraction;
  constructor(data: any, client: Client) {
    this.client = client;
    this.id = data.id;

    this.channelId = data.channel_id;

    this.author = new User(data.author, client);

    this.content = data.content;

    this.timestamp = data.timestamp;

    this.editedTimestamp = data.edited_timestamp;

    this.tts = data.tts;

    this.mentionEveryone = data.mention_everyone;

    this.mentions = data.mentions.map(
      (mention: any) => new User(mention, client)
    );
    if (this.guild) {
      this.mentionedRoles = data.mention_roles.map(
        (role: any) => new Role(role, this.guild as Guild)
      );
    } else this.mentionedRoles = [];

    this.mentionedChannels = data.mention_channels
      ? data.mention_channels.map((channel: any) =>
          findChannelType(channel, client)
        )
      : null;

    this.attachments = data.attachments;

    this.embeds = data.embeds.map((embed: any) => new Embed(embed));

    this.reactions = data.reactions;

    this.nonce = data.nonce;

    this.pinned = data.pinned;

    this.webhookId = data.webhook_id;

    this.type = data.type;

    this.activity = data.activity;

    this.application = data.application;

    this.applicationId = data.application_id;

    this.messageReference = data.message_reference;

    this.flags = data.flags;

    this.referencedMessage = data.referenced_message
      ? new Message(data.referenced_message, client)
      : null;
    // /**
    //  * @type {Interaction?}
    //  */
    // this.interaction = data.interaction;

    this.thread = data.thread ? new ThreadChannel(data.thread, client) : null;

    this.components = data.components.map(
      (row: any) =>
        new ActionRowBuilder({
          components: row.components.map((comp: any) => {
            if (comp.type === ComponentType.Button) {
              return new ButtonBuilder(comp);
            } else if (comp.type === SelectMenuBuilder) {
              return new ButtonBuilder(comp);
            } else {
              return comp;
            }
          }),
        })
    );
    /**
     * @type {MessageStickers?}
     */
    this.stickers = data.stickers
      ? data.sticker_items.map((stick: any) => new Sticker(stick, this.client))
      : null;
    if (data.interaction)
      this.interaction = new MessageInteraction(data.interaction, this.client);
  }
  get channel(): Channel | null {
    return this.client.channels.cache.get(this.channelId) ?? null;
  }
  get guild(): Guild | null {
    if (!this.channel?.inGuild()) return null;
    return this.client.guilds.cache.get(this.channel.guildId) ?? null;
  }
  createMessageComponentCollector(options: CollectorOptions) {
    return new Collector(options, this.client, { message: this });
  }
  async awaitMessageComponents(options: CollectorOptions) {
    return new Promise((resolve, reject) => {
      const collector = new Collector(options, this.client, { message: this });

      collector.once(
        "end",
        (collected: Collection<unknown, unknown>, reason: string) => {
          if (collected.size > 0) resolve(collected);
          else
            reject(
              new Error(
                `Collector ended with reason: ${reason} without collecting anything`
              )
            );
        }
      );
    });
  }
  async edit(options: MessageOptions | string) {
    if (!this.channel?.isTextBased()) return;
    if (typeof options === "string") options = { content: options };
    const message = new Message(
      await this.client.rest.patch(
        Routes.channelMessage(this.channelId, this.id),
        {
          body: options,
        }
      ),
      this.client
    );
    this.channel?.messages.cache.set(message.id, message);
    return message;
  }
  async fetch() {
    const message = new Message(
      this.client.rest.get(Routes.channelMessage(this.channelId, this.id)),
      this.client
    );
    this.client.messages.set(message.id, message);
    return message;
  }
  async delete() {
    await this.client.rest.delete(
      Routes.channelMessage(this.channelId, this.id)
    );
    return this.client.messages.delete(this.id);
  }
  toString() {
    return `${this.id}`;
  }
}

type MessageOptions = {
  content?: string;
  tts?: boolean;
  embeds?: EmbedBuilder[] | Object[];
  components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[];
  files?: AttachmentBuilder[] | string[];
};
