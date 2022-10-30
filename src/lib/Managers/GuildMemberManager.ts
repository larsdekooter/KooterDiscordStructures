import { Collection } from "@discordjs/collection";
import { makeURLSearchParams } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Colors } from "../Util/Colors.js";
import { Client } from "../Client.js";
import { Guild } from "../Guild.js";
import { Member } from "../Member.js";
import { Role } from "../Role.js";
import { Manager } from "./Manager.js";
import { EditMemberOptions } from "../Util/Options.js";

export class GuildMemberManager extends Manager<string, Member> {
  guild: Guild;
  constructor(client: Client, guild: Guild) {
    super(client);
    this.guild = guild;
  }
  get me() {
    return this.cache.get(this.client.user.id as string);
  }
  async fetch<I extends string | any>(
    id?: I
  ): Promise<I extends string ? Member : Collection<string, Member>> {
    if (id != undefined && id != null) {
      const member = new Member(
        await this.client.rest.get(
          Routes.guildMember(this.guild.id, id as unknown as string)
        ),
        this.guild
      );
      this._add(member);
      return member as any;
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
  async edit(member: Member, data: EditMemberOptions) {
    const id = member.id;
    const returnData: APIEditMemberOptions = {};
    returnData.roles = data.roles?.map((role: any) =>
      role instanceof Role ? role.id : role
    );
    returnData.nick = data.nick;
    returnData.mute = data.mute;
    returnData.deaf = data.deaf;
    returnData.channel_id = data.channelId;
    returnData.communication_disabled_until = data.communicationDisabledUntil;

    const updatedMember = new Member(
      await this.client.rest.patch(Routes.guildMember(this.guild.id, id), {
        body: returnData,
      }),
      this.guild
    );
    this._add(updatedMember);
    return updatedMember;
  }
  async remove(userId: string) {
    return await this.client.rest.delete(
      Routes.guildMember(this.guild.id, userId)
    );
  }
  private _add(data: Member) {
    this.cache.set(data.id, data);
  }
  async fetchMe(force = false) {
    if (this.cache.has(this.client.user.id))
      return this.cache.get(this.client.user.id) as Member;
    return this.fetch(this.client.user.id);
  }
}

type APIEditMemberOptions = {
  nick?: string | null;
  roles?: Role[] | string[];
  mute?: boolean;
  deaf?: boolean | null;
  channel_id?: string | null;
  communication_disabled_until?: Date | number | string | null;
};
