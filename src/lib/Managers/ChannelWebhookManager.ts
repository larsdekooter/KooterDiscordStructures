import { APIWebhook, Routes } from "discord-api-types/v10";
import { Client } from "../Client.js";
import { GuildTextChannel } from "../GuildTextChannel.js";
import { Webhook } from "../Webhook.js";
import { Manager } from "./Manager.js";

export type WebhookCreateOptions = {
  name: string;
  avatar?: string | null;
};

export class ChannelWebhookManager extends Manager<string, Webhook> {
  channelId: string;
  constructor(client: Client, channelId: string) {
    super(client);
    this.channelId = channelId;
  }
  async fetch() {
    return (
      (await this.client.rest.get(
        Routes.channelWebhooks(this.channel!.id)
      )) as APIWebhook[]
    )
      .map((webhook) => new Webhook(webhook, this.client))
      .reduce((coll, webhook) => coll.set(webhook.id, webhook), this.cache);
  }
  async create(options: WebhookCreateOptions) {
    const apiWebhook = (await this.client.rest.post(
      Routes.channelWebhooks(this.channel!.id),
      { body: options }
    )) as APIWebhook;
    const webhook = new Webhook(apiWebhook, this.client);
    this._add(webhook);
    return webhook;
  }
  private _add(data: Webhook) {
    this.cache.set(data.id, data);
  }
  async fetchSingle(id: string, token?: string) {
    return new Webhook(
      (await this.client.rest.get(Routes.webhook(id, token))) as APIWebhook,
      this.client
    );
  }
  get channel() {
    return (
      (this.client.channels.cache.get(this.channelId) as
        | GuildTextChannel
        | undefined) ?? null
    );
  }
}
