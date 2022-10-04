import { AutocompleteInteraction } from "./AutocompleteInteraction.js";
import { ChatInputCommandInteraction } from "./ChatInputCommandInteraction.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { ModalSubmitInteraction } from "./ModalSubmitInteraction.js";
import * as Builders from "@discordjs/builders";
import * as Rest from "@discordjs/rest";
import { Collection } from "@discordjs/collection";
import * as APITypes from "discord-api-types/v10";
import * as Interactions from "discord-interactions";
import { AttachmentBuilder } from "./AttachmentBuilder.js";
import fs from "fs";
import { Client } from "./Client.js";

async function ExecuteModalInteractionFunction(
  interaction: ModalSubmitInteraction,
  client: Client
): Promise<any | void> {}
async function ExecuteFunction(
  interaction: ChatInputCommandInteraction,
  client: Client
): Promise<any | void> {}
async function ExecuteComponentFunction(
  interaction: MessageComponentInteraction,
  client: Client
): Promise<any | void> {}
async function ExecuteAutocompleteInteraction(
  interaction: AutocompleteInteraction,
  client: Client
): Promise<any | void> {}
export type CommandOptions = {
  componentCustomId?: string;
  modalCustomId?: string;
  executeModal?: typeof ExecuteModalInteractionFunction;
  data: APITypes.RESTPostAPIApplicationCommandsJSONBody;
  execute?: typeof ExecuteFunction;
  executeComponent?: typeof ExecuteComponentFunction;
  executeAutocomplete?: typeof ExecuteAutocompleteInteraction;
};

export class Command {
  componentCustomId?: string;
  modalCustomId?: string;
  executeModal?: typeof ExecuteModalInteractionFunction;
  data: APITypes.RESTPostAPIApplicationCommandsJSONBody;
  execute?: typeof ExecuteFunction;
  executeComponent?: typeof ExecuteComponentFunction;
  executeAutocomplete?: typeof ExecuteAutocompleteInteraction;
  constructor(options: CommandOptions) {
    this.componentCustomId = options.componentCustomId;
    this.modalCustomId = options.modalCustomId;
    this.executeModal = options.executeModal;
    this.data = options.data;
    this.execute = options.execute;
    this.executeComponent = options.executeComponent;
    this.executeAutocomplete = options.executeAutocomplete;
  }
  static SlashCommandBuilder = Builders.SlashCommandBuilder;
  static Builders = Builders;
  static Rest = Rest;
  static Collection = Collection;
  static APITypes = APITypes;
  static Interactions = Interactions;
  static AttachmentBuilder = AttachmentBuilder;
  static fs = fs;
}
