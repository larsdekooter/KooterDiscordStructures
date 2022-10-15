import { EmbedBuilder, ModalBuilder } from "@discordjs/builders";
import { Collection } from "@discordjs/collection";
import {
  APIMessage,
  InteractionResponseType,
  Routes,
} from "discord-api-types/v10";
import { InteractionResponseFlags } from "discord-interactions";
import {
  AwaitModalSubmitOptions,
  FollowUpOptions,
  ReplyOptions,
} from "./Util/ReplyOptions.js";
import { Interaction } from "./Interaction.js";
import { Message } from "./Message.js";
import { ModalCollector } from "./ModalCollector.js";
import { ModalSubmitInteraction } from "./ModalSubmitInteraction.js";
import { RawFile } from "@discordjs/rest";

export class RepliableInteraction extends Interaction {
  async reply(options: ReplyOptions | string): Promise<Message | undefined> {
    if (typeof options === "string") options = { content: options };
    options.ephemeral
      ? (options.flags = InteractionResponseFlags.EPHEMERAL)
      : undefined;
    if (this.replied || this.deferred)
      throw new Error("Already replied to this interaction");
    await this.res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: options,
    });
    this.replied = true;
    return options.fetchReply
      ? new Message(
          (await this.rest.get(
            Routes.webhookMessage(this.applicationId, this.token)
          )) as APIMessage,
          this.client
        )
      : undefined;
  }
  async deferReply(options = { ephemeral: false }) {
    if (this.replied || this.deferred)
      throw new Error("Already replied to this interaction");
    await this.res.send({
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data: {
        flags: options.ephemeral ? InteractionResponseFlags.EPHEMERAL : null,
      },
    });
    this.deferred = true;
  }
  async followUp(options: FollowUpOptions | string) {
    if (!this.replied && !this.deferred)
      throw new Error("Not replied to this interaction!");
    if (typeof options === "string") options = { content: options };
    options.ephemeral
      ? (options.flags = InteractionResponseFlags.EPHEMERAL)
      : null;
    let files: RawFile[] | undefined;

    files = options.files?.map((file) => {
      if (typeof file !== "string") {
        return {
          data: file.attachment,
          name: file.name,
          description: file.description,
        } as RawFile;
      } else {
        return {
          data: file,
        } as RawFile;
      }
    });
    return new Message(
      await this.rest.post(`/webhooks/${this.applicationId}/${this.token}`, {
        files,
        body: options,
      }),
      this.client
    );
  }
  async showModal(modal: ModalBuilder) {
    if (this.replied || this.deferred)
      throw new Error("Already replied to this interaction!");
    await this.res.send({
      type: InteractionResponseType.Modal,
      data: modal,
    });
    this.replied = true;
  }
  async editReply(options: ReplyOptions) {
    if (!this.replied && !this.deferred)
      throw new Error("This interaction has not been replied or deferred");
    await this.rest.patch(
      Routes.webhookMessage(this.applicationId, this.token),
      {
        body: options,
      }
    );
  }
  async deleteReply() {
    if (!this.replied && !this.deferred)
      throw new Error("Not replied to this interaction");
    await this.rest.delete(
      Routes.webhookMessage(this.applicationId, this.token)
    );
  }
  async fetchReply() {
    return new Message(
      (await this.rest.get(
        Routes.webhookMessage(this.applicationId, this.token)
      )) as APIMessage,
      this.client
    );
  }
  async awaitModalSubmit(
    options: AwaitModalSubmitOptions
  ): Promise<ModalSubmitInteraction> {
    return new Promise((resolve, reject) => {
      const collector = new ModalCollector(
        options,
        this.client,
        this.channelId
      );
      collector.once(
        "end",
        (
          collected: Collection<string, ModalSubmitInteraction>,
          reason: string
        ) => {
          const interaction = collected.first();
          if (interaction) resolve(interaction);
          else reject(new Error("Collector ended with reason: " + reason));
        }
      );
    });
  }
}
