import { InteractionType } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { Member } from "./Member.js";
import { User } from "./User.js";

export class MessageInteraction {
  id: string;
  type: InteractionType;
  name: string;
  user: User;
  member: Member;
  client: Client;
  constructor(data: any, client: Client) {
    this.id = data.id;
    this.type = data.type;
    this.user = data.user;
    this.member = data.member;
    this.name = data.name;
    this.client = client;
  }
}
