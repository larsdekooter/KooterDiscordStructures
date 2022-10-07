import { Collection } from "@discordjs/collection";
import { EventEmitter } from "events";
import { AwaitModalSubmitOptions } from "./Util/ReplyOptions.js";
import { Client } from "./Client.js";
import { ModalSubmitInteraction } from "./ModalSubmitInteraction.js";

let startNumber = 1;

function* GenerateId() {
  while (true) {
    yield startNumber++;
  }
}

const gen = GenerateId();

export class ModalCollector extends EventEmitter {
  #counter: number;
  #ended: boolean;
  #timeout: NodeJS.Timeout;
  #timeoutTime: number;
  #amount: number;
  #channelId: string;
  client: Client;
  collected: Collection<string, ModalSubmitInteraction>;
  filter: Function;
  max: number;

  constructor(
    options: AwaitModalSubmitOptions,
    client: Client,
    channelId: string
  ) {
    super();
    this.#amount = gen.next().value as number;
    this.client = client;
    this.#counter = 0;
    this.collected = new Collection<string, ModalSubmitInteraction>();
    this.filter = options.filter ?? (() => true);
    this.client.modalCollectors.set(this.#amount, this);
    this.max = 1;
    this.#ended = false;
    this.#timeoutTime = options.time ?? 15000;
    this.#timeout = setTimeout(() => {
      this.stop("TIME_END");
    }, this.#timeoutTime);
    this.#channelId = channelId;
  }

  collect(interaction: ModalSubmitInteraction) {
    if (this.#ended) return;
    const filterBool = this.filter(interaction);
    if (this.#channelId !== interaction.channelId) {
      return this.emit("wrongChannel", interaction);
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
    this.client.modalCollectors.delete(this.#amount);
  }
}
