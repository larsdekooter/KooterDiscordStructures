import { OverwriteType } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { GuildChannel } from "./GuildChannel.js";
import { PermissionsBitField } from "./PermissionsBitField.js";

export class PermissionOverwrites {
  allow: Readonly<PermissionsBitField>;
  channel: GuildChannel;
  client: Client;
  deny: Readonly<PermissionsBitField>;
  id: string;
  type: OverwriteType;
  constructor(data: any, channel: GuildChannel, client: Client) {
    this.allow = data.allow;
    this.channel = channel;
    this.client = client;
    this.deny = data.deny;
    this.id = data.id;
    this.type = data.type;
  }
}
