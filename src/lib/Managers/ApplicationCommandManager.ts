import { isJSONEncodable, SlashCommandBuilder } from "@discordjs/builders";
import { Collection } from "@discordjs/collection";
import {
  APIApplicationCommand,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord-api-types/v10";
import { ApplicationCommand } from "../ApplicationCommand.js";
import { Manager } from "./Manager.js";

export class ApplicationCommandManager extends Manager<
  string,
  ApplicationCommand
> {
  async fetch<T extends string | any>(
    id?: T,
    force = false
  ): Promise<
    T extends string
      ? ApplicationCommand
      : Collection<string, ApplicationCommand>
  > {
    if (id && force) {
      const data = (await this.client.rest.get(
        Routes.applicationCommand(this.client.user.id, id as unknown as string)
      )) as APIApplicationCommand;
      const command = new ApplicationCommand(data, this.client);
      return this._add(command) as any;
    } else if (!id) {
      this.cache.clear();
      const data = (
        (await this.client.rest.get(
          Routes.applicationCommands(this.client.user.id)
        )) as APIApplicationCommand[]
      ).map((command) => new ApplicationCommand(command, this.client));
      data.forEach((command) => this._add(command));
      return this.cache as any;
    }
    if (this.cache.has(id as unknown as string))
      return this.cache.get(id as unknown as string) as any;
    return await this.fetch(id, true);
  }
  private _add(data: ApplicationCommand) {
    this.cache.set(data.id, data);
    return data;
  }
  async create(
    command: SlashCommandBuilder | RESTPostAPIApplicationCommandsJSONBody
  ) {
    const data = isJSONEncodable(command) ? command.toJSON() : command;

    return this._add(
      new ApplicationCommand(
        (await this.client.rest.post(
          Routes.applicationCommands(this.client.user.id)
        )) as APIApplicationCommand,
        this.client
      )
    );
  }
  async delete(id: string) {
    return await this.client.rest.delete(
      Routes.applicationCommand(this.client.user.id, id)
    );
  }
}
