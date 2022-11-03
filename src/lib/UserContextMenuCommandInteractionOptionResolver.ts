import { APIGuildMember, APIUser } from "discord-api-types/v10";
import { Client } from "./Client.js";
import { Guild } from "./Guild.js";
import { Member } from "./Member.js";
import { User } from "./User.js";
export type UserContextMenuCommandInteractionDataOptions = {
  members?: { [key: string]: APIGuildMember };
  users: { [key: string]: APIUser };
};
export class UserContextMenuCommandInteractionOptionResolver {
  options: UserContextMenuCommandInteractionDataOptions;
  targetId: string;
  client: Client;
  guild: Guild | null;
  constructor(
    options: UserContextMenuCommandInteractionDataOptions,
    targetId: string,
    client: Client,
    guild: Guild | null
  ) {
    this.options = options;
    this.targetId = targetId;
    this.client = client;
    this.guild = guild;
  }
  getUser() {
    const { users } = this.options;
    const targetUser = users[this.targetId];
    return new User(targetUser, this.client);
  }
  getMember() {
    if (this.guild) {
      const { members, users } = this.options;
      const targetUser = users[this.targetId];
      const targetmember = members![this.targetId];
      targetmember.user = targetUser;
      return new Member(targetmember, this.guild!.id, this.client);
    }
    return null;
  }
  get user() {
    return this.getUser();
  }
}
