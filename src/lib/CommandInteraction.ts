import {
  APIApplicationCommandInteraction,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { RepliableInteraction } from "./RepliableInteraction.js";
import { Response } from "./Util/HTTPTypes.js";

export class CommandInteraction extends RepliableInteraction {
  commandType: ApplicationCommandType;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.commandType = interaction.data.type;
  }
}
