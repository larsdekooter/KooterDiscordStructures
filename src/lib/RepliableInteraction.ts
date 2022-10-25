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
import { resolveFiles } from "./Util/Utils.js";
import { MessagePayload } from "./MessagePayload.js";

export class RepliableInteraction extends Interaction {
  async reply(options: ReplyOptions | string): Promise<Message | undefined> {
    if (this.replied || this.deferred)
      throw new Error("Already replied to this interaction");
    if (typeof options === "string") options = { content: options };
    options.ephemeral
      ? (options.flags = InteractionResponseFlags.EPHEMERAL)
      : undefined;
    const files = await new MessagePayload({
      files: options.files,
    }).resolveFiles();
    await this.client.rest.post(
      Routes.interactionCallback(this.id, this.token),
      {
        body: {
          data: options,
          type: InteractionResponseType.ChannelMessageWithSource,
        },
        auth: false,
        files,
      }
    );
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
    await this.client.rest.post(
      Routes.interactionCallback(this.id, this.token),
      {
        body: {
          type: InteractionResponseType.DeferredChannelMessageWithSource,
          data: {
            flags: options.ephemeral
              ? InteractionResponseFlags.EPHEMERAL
              : null,
          },
        },
        auth: false,
      }
    );
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
    files = await new MessagePayload({ files: options.files }).resolveFiles();
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
    await this.client.rest.post(
      Routes.interactionCallback(this.id, this.token),
      {
        body: {
          type: InteractionResponseType.Modal,
          data: modal,
        },
        auth: false,
      }
    );
    this.replied = true;
  }
  async editReply(options: FollowUpOptions) {
    if (!this.replied && !this.deferred)
      throw new Error("This interaction has not been replied or deferred");
    const files = await new MessagePayload({
      files: options.files,
    }).resolveFiles();
    await this.rest.patch(
      Routes.webhookMessage(this.applicationId, this.token),
      {
        body: options,
        files,
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
