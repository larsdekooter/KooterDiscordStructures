import { Client } from "./Client.js";
import { ContextMenuCommandInteraction } from "./ContextMenuCommandInteraction.js";
import { MessageContextMenuCommandInteractionOptionResolver } from "./MessageContextMenuCommandInteractionOptionResolver.js";
import { Response } from "./Util/HTTPTypes.js";

export class MessageContextMenuCommandInteraction extends ContextMenuCommandInteraction {
  targetId: string;
  options: MessageContextMenuCommandInteractionOptionResolver;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    const { data } = interaction;
    this.targetId = data.target_id;
    this.options = new MessageContextMenuCommandInteractionOptionResolver(
      data.resolved,
      this.targetId,
      this.client
    );
  }
}
