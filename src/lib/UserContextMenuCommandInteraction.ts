import {
  APIApplicationCommandInteractionData,
  APIContextMenuInteractionData,
  APIGuildMember,
  APIInteractionDataResolvedGuildMember,
  APIMessage,
  APIUser,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10.js";
import { Client } from "./Client.js";
import { CommandInteractionOption } from "./CommandInteraction.js";
import { ContextMenuCommandInteraction } from "./ContextMenuCommandInteraction.js";
import { User } from "./User.js";
import { Response } from "./Util/HTTPTypes.js";

export class UserContextMenuCommandInteraction extends ContextMenuCommandInteraction {
  targetId: string;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    const { data } = interaction;
    this.targetId = data.target_id;
  }
}
