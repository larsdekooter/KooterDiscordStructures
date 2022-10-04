import { Client } from "./Client.js";
import { ContextMenuCommandInteraction } from "./ContextMenuCommandInteraction.js";
import { UserContextMenuCommandInteractionOptionResolver } from "./UserContextMenuCommandInteractionOptionResolver.js";
import { Response } from "./Util/HTTPTypes.js";

export class UserContextMenuCommandInteraction extends ContextMenuCommandInteraction {
  targetId: string;
  options: UserContextMenuCommandInteractionOptionResolver;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    const { data } = interaction;
    this.targetId = data.target_id;
    this.options = new UserContextMenuCommandInteractionOptionResolver(
      data.resolved,
      this.targetId,
      this.client,
      this.guild
    );
  }
}
