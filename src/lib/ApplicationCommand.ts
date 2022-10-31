import { Collection } from "@discordjs/collection";
import {
  APIApplicationCommand,
  APIApplicationCommandOption,
  ApplicationCommandType,
  LocalizationMap,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { PermissionsBitField } from "./PermissionsBitField.js";

export class ApplicationCommand {
  client: Client;
  id: string;
  type: ApplicationCommandType;
  applicationId: string;
  guildId?: string;
  name: string;
  nameLocalizations: LocalizationMap;
  description: string;
  descriptionLocalizations: LocalizationMap;
  options?: APIApplicationCommandOption[];
  defaultMemberPermissions: PermissionsBitField | null;
  dmPermission?: boolean;
  /**
   * @deprecated
   */
  defaultPermission?: boolean;
  version: string;
  constructor(data: APIApplicationCommand, client: Client) {
    this.client = client;
    this.id = data.id;
    this.type = data.type;
    this.applicationId = data.application_id;
    this.guildId = data.guild_id;
    this.name = data.name;
    this.nameLocalizations = data.name_localizations as LocalizationMap;
    this.description = data.description;
    this.descriptionLocalizations =
      data.description_localizations as LocalizationMap;
    this.options = data.options;
    this.defaultMemberPermissions = data.default_member_permissions
      ? new PermissionsBitField(data.default_member_permissions)
      : null;
    this.dmPermission = data.dm_permission;
    this.defaultPermission = data.default_permission;
    this.version = data.version;
  }
  fetch(force = false) {
    return this.client.application.commands.fetch(this.id, force);
  }
}
