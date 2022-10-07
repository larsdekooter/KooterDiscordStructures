import { Collection } from "@discordjs/collection";
import { Routes } from "discord-api-types/v10";
import { Client } from "../Client.js";
import { User } from "../User.js";
import { Manager } from "./Manager.js";

export class UserManager extends Manager<string, User> {
  async fetch(id: string, force = false): Promise<User | null> {
    if (!id) throw new Error("Id is required when fetching users!");
    if (force) {
      const apiUser = await this.client.rest.get(Routes.user(id));
      const user = new User(apiUser, this.client);
      this.cache.set(user.id, user);
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
}
