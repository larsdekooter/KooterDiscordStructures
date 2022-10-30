import { APIDMChannel, ChannelType, Routes } from "discord-api-types/v10";
import { DMChannel } from "../DMChannel.js";
import { User } from "../User.js";
import { Manager } from "./Manager.js";

export class UserManager extends Manager<string, User> {
  async fetch(id: string, force = false): Promise<User | null> {
    if (!id) throw new Error("Id is required when fetching users!");
    if (force) {
      const apiUser = await this.client.rest.get(Routes.user(id));
      const user = new User(apiUser, this.client);
      this._add(user);
      return user;
    } else {
      if (this.cache.has(id)) return this.cache.get(id) ?? null;
      else {
        return this.fetch(id, true);
      }
    }
  }
  private _add(data: User) {
    this.cache.set(data.id, data);
    return this.cache.get(data.id);
  }
  async createDM(id: string, force = false) {
    if (!force) {
      const dmChannel = this.client.channels.cache.find(
        (c) => c.isDMBased() && c.recipientId === id
      ) as DMChannel;
      if (dmChannel && !dmChannel.partial) return dmChannel;
    }

    const data = new DMChannel(
      (await this.client.rest.post(Routes.userChannels(), {
        body: { recipient_id: id },
      })) as APIDMChannel,
      this.client
    );
    this.client.channels.cache.set(data.id, data);
    return data;
  }
}
