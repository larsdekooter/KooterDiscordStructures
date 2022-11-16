import {
  APIInteractionDataResolvedGuildMember,
  APIMessage,
  APIUser,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { CommandInteraction } from "./CommandInteraction.js";
import { CommandInteractionOptionResolver } from "./CommandInteractionOptionResolver.js";
import { Message } from "./Message.js";
import { Response } from "./Util/HTTPTypes.js";
import { CommandInteractionOption } from "./ChatInputCommandInteraction.js";
export class ContextMenuCommandInteraction extends CommandInteraction {
  options: Omit<
    CommandInteractionOptionResolver,
    | "getMentionable"
    | "getRole"
    | "getNumber"
    | "getInteger"
    | "getString"
    | "getChannel"
    | "getBoolean"
    | "getSubcommandGroup"
    | "getSubcommand"
    | "getAttachment"
  >;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.options = new CommandInteractionOptionResolver(
      this.resolveContextMenuOptions(interaction.data),
      this.client,
      interaction.data.target_id
    );
  }
  resolveContextMenuOptions({
    target_id,
    resolved,
  }: {
    target_id: string;
    resolved: {
      users?: { [key: string]: APIUser };
      members?: { [key: string]: APIInteractionDataResolvedGuildMember };
      messages: { [key: string]: APIMessage };
    };
  }) {
    const result: CommandInteractionOption[] = [];

    if (resolved.users?.[target_id]) {
      result.push(
        this.transformOption(
          {
            name: "user",
            type: ApplicationCommandOptionType.User,
            value: target_id,
          },
          resolved
        )
      );
    }
    if (resolved.messages?.[target_id]) {
      result.push({
        name: "message",
        type: "_MESSAGE" as any,
        value: target_id,
        message: new Message(resolved.messages[target_id], this.client),
      });
    }
    return result;
  }
}
