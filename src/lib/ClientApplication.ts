import {
  APIApplication,
  APITeam,
  ApplicationFlags,
  Routes,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { ApplicationCommandManager } from "./Managers/ApplicationCommandManager.js";
import { User } from "./User.js";

export class ClientApplication {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  /**
   * @deprecated Will be removed in v11
   */
  summary: string;
  botPublic: boolean;
  botRequireCodeGrant: boolean;
  termsOfServiceURL?: string;
  privacyPolicyURL?: string;
  owner?: Partial<User>;
  team: APITeam | null;
  verifyKey: string;
  flags: ApplicationFlags;
  client: Client;
  commands: ApplicationCommandManager;
  constructor(data: APIApplication = {} as APIApplication, client: Client) {
    this.client = client;
    this._patch(data);
  }
  private _patch(data: APIApplication) {
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.description = data.description;
    this.summary = data.summary;
    this.botPublic = data.bot_public;
    this.termsOfServiceURL = data.terms_of_service_url;
    this.privacyPolicyURL = data.privacy_policy_url;
    this.owner = new User(data.owner ?? {}, this.client);
    this.team = data.team;
    this.verifyKey = data.verify_key;
    this.flags = data.flags;
    this.commands = new ApplicationCommandManager(this.client);
  }
  async fetch() {
    const apiApplication = (await this.client.rest.get(
      Routes.oauth2CurrentApplication()
    )) as APIApplication;
    this._patch(apiApplication);
    return this;
  }
  get partial() {
    return !this.name;
  }
}
