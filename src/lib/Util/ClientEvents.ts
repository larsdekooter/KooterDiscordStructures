import { Channel } from "../Channel";
import { Client } from "../Client";
import { Guild } from "../Guild";
import { Interaction } from "../Interaction";
import { PartialGuild } from "../PartialGuild";

export interface ClientEvents {
  ready: [client: Client];
  debug: [message: string];
  interactionCreate: [interaction: Interaction];
}
