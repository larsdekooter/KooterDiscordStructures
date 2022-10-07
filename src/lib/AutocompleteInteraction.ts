import { Snowflake } from "discord-api-types/globals";
import {
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { Interaction } from "./Interaction.js";
import { Response } from "./Util/HTTPTypes.js";
export type AutocompleteInteractionData = {
  guildId: Snowflake;
  id: Snowflake;
  name: string;
  options: [
    {
      focused: boolean;
      name: string;
      type: ApplicationCommandOptionType;
      value: string;
    }
  ];
};

export class AutocompleteInteraction extends Interaction {
  data: AutocompleteInteractionData;
  responded: boolean;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      guildId: interaction.data.guild_id,
      id: interaction.data.id,
      name: interaction.data.name,
      options: interaction.data.options,
    };

    this.responded = false;
  }
  get commandName() {
    return this.data.name;
  }
  async respond(items: { value: string; name: string }[]) {
    if (this.responded)
      throw new Error("Already Responded to this interaction");
    this.res.send({
      data: {
        choises: items,
      },
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
    });
    this.responded = true;
  }
  getFocused() {
    return this.data.options.find((option) => option.focused);
  }
}
