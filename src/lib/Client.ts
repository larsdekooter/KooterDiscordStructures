import { Collection } from "@discordjs/collection";
import { REST } from "@discordjs/rest";
import {
  APIApplication,
  APIUser,
  ApplicationCommandType,
  ComponentType,
  InteractionType,
  Routes,
} from "discord-api-types/v10";
import e, { Express } from "express";
import { ChatInputCommandInteraction } from "./ChatInputCommandInteraction.js";
import { ChannelManager } from "./Managers/ChannelManager.js";
import { GuildManager } from "./Managers/GuildManager.js";
import { UserManager } from "./Managers/UserManager.js";
import { Message } from "./Message.js";
import { ModalCollector } from "./ModalCollector.js";
import { Colors } from "./Util/Colors.js";
import { Collector, CollectorEvents } from "./Collector.js";
import { PartialGuild } from "./PartialGuild.js";
import { ClientEvents } from "./Util/ClientEvents.js";
import { Interaction } from "./Interaction.js";
import { verifyKeyMiddleware } from "discord-interactions";
import { Member } from "./Member.js";
import { AutocompleteInteraction } from "./AutocompleteInteraction.js";
import { SelectMenuInteraction } from "./SelectMenuInteraction.js";
import { ButtonInteraction } from "./ButtonInteraction.js";
import { ModalSubmitInteraction } from "./ModalSubmitInteraction.js";
import { Guild } from "./Guild.js";
import { MessageContextMenuCommandInteraction } from "./MessageContextMenuCommandInteraction.js";
import { UserContextMenuCommandInteraction } from "./UserContextMenuCommandInteraction.js";
import EventEmitter from "events";
import { ClientApplication } from "./ClientApplication.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { ClientUser } from "./ClientUser.js";

export enum RESTResponseStatusCodes {
  RateLimit = 429,
}

export declare interface Client extends EventEmitter {
  on<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => void
  ): this;
  once<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => void
  ): this;
  emit<K extends keyof ClientEvents>(
    eventName: K,
    ...args: ClientEvents[K]
  ): boolean;
}

export class Client extends EventEmitter {
  latestResponseStatusCode: RESTResponseStatusCodes;
  collectors = new Collection<number, Collector>();
  modalCollectors = new Collection<number, ModalCollector>();
  rest: REST;
  guilds = new GuildManager(this);
  channels = new ChannelManager(this);
  app: Express;
  isReady = false;
  partialGuilds = new Collection<string, PartialGuild>();
  id = process.env.id;
  token = process.env.token;
  messages = new Collection<string, Message>();
  users = new UserManager(this);
  application = new ClientApplication({} as APIApplication, this);
  user: ClientUser;
  constructor(
    app: Express,
    interactionOptions?: { clientPublicKey: string; route: string }
  ) {
    super();
    this.rest = new REST();
    this.app = app;
    this.latestResponseStatusCode = 200;
    this.user = new ClientUser({} as APIUser, this);
    if (interactionOptions) {
      this.app.post(
        interactionOptions.route,
        verifyKeyMiddleware(interactionOptions.clientPublicKey),
        async (req, res) => {
          let interaction: Interaction;
          switch (req.body.type) {
            case InteractionType.ApplicationCommand: {
              if (req.body.data.type === ApplicationCommandType.ChatInput) {
                interaction = new ChatInputCommandInteraction(
                  res,
                  req.body,
                  this
                );
              } else if (
                req.body.data.type === ApplicationCommandType.Message
              ) {
                interaction = new MessageContextMenuCommandInteraction(
                  res,
                  req.body,
                  this
                );
              } else {
                interaction = new UserContextMenuCommandInteraction(
                  res,
                  req.body,
                  this
                );
              }
              break;
            }
            case InteractionType.ApplicationCommandAutocomplete: {
              interaction = new AutocompleteInteraction(res, req.body, this);
              break;
            }
            case InteractionType.MessageComponent: {
              if (req.body.data.component_type === ComponentType.SelectMenu) {
                interaction = new SelectMenuInteraction(res, req.body, this);
                break;
              } else if (
                req.body.data.component_type === ComponentType.Button
              ) {
                interaction = new ButtonInteraction(res, req.body, this);
                break;
              }
            }
            case InteractionType.ModalSubmit: {
              interaction = new ModalSubmitInteraction(res, req.body, this);
              break;
            }
            default: {
              interaction = new Interaction(res, req.body, this);
              break;
            }
          }
          await this.channels.fetch(interaction.channelId);
          if (interaction.guildId) {
            interaction.guild = (await this.guilds.fetch(
              interaction.guildId
            )) as Guild;
            interaction.member = new Member(
              interaction._member,
              interaction.guild
            );
          }
          if (interaction.isMessageComponentInteraction()) {
            this.collectors.forEach((collector) =>
              collector.collect(interaction as MessageComponentInteraction)
            );
          }
          if (interaction.isModalSubmit()) {
            this.modalCollectors.forEach((collector) =>
              collector.collect(interaction as ModalSubmitInteraction)
            );
          }
          this.emit("interactionCreate", interaction);
        }
      );
    }
  }
  get isRatelimited() {
    return this.latestResponseStatusCode === RESTResponseStatusCodes.RateLimit;
  }
  get latestCode() {
    return this.latestResponseStatusCode;
  }
  async login(token = process.env.token) {
    if (!token) throw new Error("Token is required");
    this.rest.setToken(token);
    this.rest.on("response", (req, res) => {
      // Amount of ms the ratelimit is going to take
      const retryData =
        Number(res.headers["retry-after"]) * 1e3 +
        this.rest.requestManager.options.offset;
      let data =
        Colors.cyan("[RESPONSE]: ") + req.route + " " + res.statusCode + " ";
      if (res.statusCode === RESTResponseStatusCodes.RateLimit) {
        data +=
          "\n" +
          "Retries in " +
          retryData +
          "ms - " +
          (retryData / 1000).toFixed(1) +
          "s - " +
          (retryData / 1000 / 60).toFixed(1) +
          "h";
      }
      this.latestResponseStatusCode = res.statusCode;
      this.emit("debug", data);
    });
    const guildData = ((await this.rest.get(Routes.userGuilds())) as any[]).map(
      (apiguild) => new PartialGuild(apiguild, this)
    );

    guildData.reduce(
      (coll: Collection<string, PartialGuild>, guild: PartialGuild) =>
        coll.set(guild.id, guild),
      this.partialGuilds
    );
    this.emit("debug", `${Colors.red("[LOADED]: ")} Partial Guilds`);

    await new Promise<void>((resolve, reject) => {
      this.partialGuilds.forEach(async (guild: PartialGuild) => {
        const guildChannels = await guild.fetchChannels();
        guildChannels.forEach((channel) => {
          this.channels.cache.set(channel.id, channel);
        });
        resolve();
      });
    });
    this.isReady = true;
    this.emit(
      "debug",
      `${Colors.red("[LOADED]: ")} All channels and client became ready`
    );
    this.emit("ready", this);
    return this;
  }
  toString() {
    return `${this.id}`;
  }
  async setGuildCommands(clientId: string, guildId: string, commands: any[]) {
    if (!this.isReady)
      throw new Error("Client needs to be ready in order to use this");
    await this.rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    this.emit("debug", `${Colors.green("[LOADED]: ")} Commands`);
  }
  async deleteCommands(prod = false) {
    const guildId = prod ? "972418027066884116" : "950680035411501056";
    if (!this.isReady)
      throw new Error("Client has to be ready in order to use this");
    const commands: any[] = [];
    await this.rest.put(
      Routes.applicationGuildCommands(this.id as string, guildId),
      {
        body: commands,
      }
    );
    console.log(`${Colors.red("[DELETED]: ")} Commands`);
  }
  async loginWithoutFetching(token: string | undefined = process.env.token) {
    if (!token) throw new Error("If you log in, specify a token");
    this.rest.setToken(token);
    this.emit("ready", this);
  }
  setToken(token: string) {
    this.rest.setToken(token);
  }
}
