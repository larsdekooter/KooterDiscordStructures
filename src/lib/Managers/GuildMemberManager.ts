import { Collection } from "@discordjs/collection";
import { makeURLSearchParams } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Colors } from "../Util/Colors.js";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { Member } from "../Member.js";
import { Role } from "../Role.js";
import { Manager } from "./Manager.js";

export class GuildMemberManager extends Manager<string, Member> {
  guild: Guild;
  constructor(client: Client, guild: Guild) {
    super(client);
    this.guild = guild;
  }
  get me() {
    return this.cache.get(this.client.id as string);
  }
  async fetch(id?: string): Promise<Member | Collection<string, Member>> {
    if (id) {
      const member = new Member(
        await this.client.rest.get(Routes.guildMember(this.guild.id, id)),
        this.guild
      );
      this.cache.set(member.id, member);
      return member;
    } else {
      const members = (await this.client.rest.get(
        Routes.guildMembers(this.guild.id),
        {
          query: makeURLSearchParams({ limit: 1000 }),
        }
      )) as any[];
      this.client.emit(
        "debug",
        `${Colors.cyan("[RECIEVING]: ")} Recieved ${
          members.length
        } members from ${this.guild.name}`
      );
      return members.reduce(
        (coll: Collection<string, Member>, member: any) =>
          coll.set(member.user.id, new Member(member, this.guild)),
        this.cache
      );
    }
  }
  async edit(member: Member, data: any) {
    const id = member.id;
    data.roles &&= data.roles.map((role: any) =>
      role instanceof Role ? role.id : role
    );

    const updatedMember = new Member(
      await this.client.rest.patch(Routes.guildMember(this.guild.id, id), {
        body: data,
      }),
      this.guild
    );
    this.cache.set(updatedMember.id, updatedMember);
    return updatedMember;
  }
  async remove(userId: string) {
    return await this.client.rest.delete(
      Routes.guildMember(this.guild.id, userId)
    );
  }
}