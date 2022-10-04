import { Collection } from "@discordjs/collection";
import { Client } from "../Client.js";

export class Manager<Key, Value> {
  client: Client;
  cache: Collection<Key, Value>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection<Key, Value>();
  }
}
