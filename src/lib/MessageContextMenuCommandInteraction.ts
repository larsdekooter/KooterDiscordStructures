import { Client } from "./Client.js";
import { ContextMenuCommandInteraction } from "./ContextMenuCommandInteraction.js";
import { Response } from "./Util/HTTPTypes.js";

export class MessageContextMenuCommandInteraction extends ContextMenuCommandInteraction {
  targetId: string;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    const { data } = interaction;
    this.targetId = data.target_id;
  }
}
