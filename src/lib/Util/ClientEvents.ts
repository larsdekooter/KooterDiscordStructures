import { Channel } from "../Channel";
import { Client } from "../Client";
import { Guild } from "../Guild";
import { Interaction } from "../Interaction";
import { PartialGuild } from "../PartialGuild";

export interface ClientEvents {
  ready: [client: Client];
  debug: [message: string];
  guildUpdate: [oldGuild: Guild | PartialGuild | undefined, newGuild: Guild];
  channelUpdate: [oldChannel: Channel | undefined, newChannel: Channel];
  interactionCreate: [interaction: Interaction];
}
