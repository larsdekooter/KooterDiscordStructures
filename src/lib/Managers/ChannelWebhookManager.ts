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
  channel: GuildTextChannel;
  constructor(client: Client, channel: GuildTextChannel) {
    super(client);
    this.channel = channel;
  }
  async fetch(id?: string) {
    if (id) {
      const webhook = new Webhook(
        (await this.client.rest.get(Routes.webhook(id))) as APIWebhook,
        this.client
      );
      this._add(webhook);
      if (webhook) return webhook;
      return null;
    }
    return (
      (await this.client.rest.get(
        Routes.channelWebhooks(this.channel.id)
      )) as APIWebhook[]
    )
      .map((webhook) => new Webhook(webhook, this.client))
      .reduce((coll, webhook) => coll.set(webhook.id, webhook), this.cache);
  }
  async create(options: WebhookCreateOptions) {
    const apiWebhook = (await this.client.rest.post(
      Routes.channelWebhooks(this.channel.id),
      { body: options }
    )) as APIWebhook;
    const webhook = new Webhook(apiWebhook, this.client);
    this._add(webhook);
    return webhook;
  }
  private _add(data: Webhook) {
    this.cache.set(data.id, data);
  }
}
