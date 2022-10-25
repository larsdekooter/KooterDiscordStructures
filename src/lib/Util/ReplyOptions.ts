import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { AttachmentBuilder } from "../AttachmentBuilder.js";
import { ModalSubmitInteraction } from "../ModalSubmitInteraction.js";

export type ReplyOptions = {
  content?: string;
  embeds?: EmbedBuilder[];
  components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[];
  ephemeral?: boolean;
  allowed_mentions?: {
    users?: [];
    roles?: [];
    channels?: [];
    replied_user?: boolean;
  };
  fetchReply?: boolean;
  flags?: number;
  files?: AttachmentBuilder[] | string[];
};

export type FollowUpOptions = {
  content?: string;
  embeds?: EmbedBuilder[];
  components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[];
  ephemeral?: boolean;
  allowed_mentions?: {
    users?: [];
    roles?: [];
    channels?: [];
    replied_user?: boolean;
  };
  fetchReply?: boolean;
  flags?: number;
  files?: AttachmentBuilder[] | string[];
};

export type AwaitModalSubmitOptions = {
  filter?: (i: ModalSubmitInteraction) => boolean;
  time?: number;
};
