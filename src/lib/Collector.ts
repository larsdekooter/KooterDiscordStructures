import { Collection } from "@discordjs/collection";
import { Client } from "./Client.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { Message } from "./Message.js";
import { EventEmitter } from "events";
import { CollectorOptions } from "./Util/CollectorOptions.js";
import { Channel } from "./Channel.js";

let startnumber = 1;
function* GenerateId() {
  while (true) {
    yield startnumber++;
  }
}

const gen = GenerateId();

// export type CollectorOptions = {
//   filter?: (interaction: MessageComponentInteraction) => boolean;
//   max?: number;
//   time?: number;
//   type?: string;
// };

export declare interface Collector extends EventEmitter {
  on<K extends keyof CollectorEvents>(
    event: K,
    listener: (...args: CollectorEvents[K]) => void
  ): this;
  once<K extends keyof CollectorEvents>(
    event: K,
    listener: (...args: CollectorEvents[K]) => void
  ): this;
}

export class Collector extends EventEmitter {
  #counter: number;
  #ended: boolean;
  #timeout: NodeJS.Timeout;
  #timeoutTime: number;
  #amount: number;
  #message?: Message;
  client: Client;
  collected: Collection<string, MessageComponentInteraction>;
  max?: number;
  filter: Function;
  #channel?: Channel;
  constructor(
    options: CollectorOptions,
    client: Client,
    messageOrChannel: { message?: Message; channel?: Channel }
  ) {
    super();
    this.#amount = gen.next().value as number;
    this.client = client;
    this.#counter = 0;
    this.collected = new Collection();
    this.filter = options.filter ?? (() => true);
    this.client.collectors.set(this.#amount, this);
    this.max = options.max ?? 100;
    this.#ended = false;
    this.#timeoutTime = options.time ?? 15000;
    this.#message = messageOrChannel.message;
    this.#channel = messageOrChannel.channel;
    //If the timeout expires, end the collector
    this.#timeout = setTimeout(() => {
      this.stop("TIME_END");
    }, this.#timeoutTime);
  }
  collect(interaction: MessageComponentInteraction) {
    if (this.#ended) return;
    const filterBool = this.filter(interaction) as boolean;
    if (this.#message && this.#message?.id !== interaction.message.id) {
      console.log("wrongmessage", this.#message?.id, interaction.message.id);
      return this.emit("wrongMessage", interaction);
    }
    if (this.#channel && this.#channel?.id !== interaction.channel?.id) {
      console.log("wrongChannel", this.#channel?.id, interaction.channel?.id);
      return this.emit("wrongMessage", interaction);
    }
    if (filterBool) {
      this.#counter++;
      this.collected.set(interaction.id, interaction);
      this.emit("collect", interaction);
      if (this.#counter === this.max) {
        this.#ended = true;
        this.stop("MAX");
      }
    } else {
      this.emit("ignore", interaction);
    }
  }
  stop(reason = "user") {
    this.#ended = true;
    clearTimeout(this.#timeout);
    this.emit("end", this.collected, reason);
    this.#removeFromClientCollectors();
  }
  #removeFromClientCollectors() {
    this.client.collectors.delete(this.#amount);
    return this.client.collectors;
  }
}

export type CollectorEvents = {
  collect: [interaction: MessageComponentInteraction];
  ignore: [interaction: MessageComponentInteraction];
  end: [
    collected: Collection<string, MessageComponentInteraction>,
    reason: string
  ];
};
