import { Snowflake } from "discord-api-types/globals";
import {
  ApplicationCommandOptionType,
  InteractionResponseType,
  LocalizationMap,
  Routes,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { CommandInteractionOptionResolver } from "./CommandInteractionOptionResolver.js";
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
  options: Omit<
    CommandInteractionOptionResolver,
    | "getMessage"
    | "getUser"
    | "getAttachment"
    | "getChannel"
    | "getMember"
    | "getMentionable"
    | "getRole"
  >;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      guildId: interaction.data.guild_id,
      id: interaction.data.id,
      name: interaction.data.name,
      options: interaction.data.options,
    };
    this.options = new CommandInteractionOptionResolver(
      interaction.data.options ?? [],
      this.client,
      this.guildId
    );
    this.responded = false;
  }
  get commandName() {
    return this.data.name;
  }
  async respond(
    items: { value: string; name: string; nameLocalizations: LocalizationMap }[]
  ) {
    if (this.responded)
      throw new Error("Already Responded to this interaction");
    const choises = items.map((item) => ({
      name: item.name,
      value: item.value,
      name_Localizations: item.nameLocalizations,
    }));
    await this.client.rest.post(
      Routes.interactionCallback(this.id, this.token),
      {
        body: {
          type: InteractionResponseType.ApplicationCommandAutocompleteResult,
          data: {
            choices: choises,
          },
        },
        auth: false,
      }
    );
    this.responded = true;
  }
  getFocused() {
    return this.data.options.find((option) => option.focused);
  }
}
