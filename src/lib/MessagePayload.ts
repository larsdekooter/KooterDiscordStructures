import { RawFile } from "@discordjs/rest";
import { APIMessage } from "discord-api-types/v10";
import { basename } from "./Util/Utils.js";
import { DataResolver } from "./DataResolver.js";
import { Stream } from "stream";
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  JSONEncodable,
  SelectMenuBuilder,
} from "@discordjs/builders";
import { AttachmentBuilder } from "./AttachmentBuilder.js";

type BufferResolvable = Buffer | string;
interface AttachmentPayload {
  attachment: BufferResolvable | Stream;
  name?: string;
  description?: string;
}

type MessageCreateOptions = {
  content?: string;
  tts?: boolean;
  embeds?: EmbedBuilder[] | Object[];
  components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[];
  files?: AttachmentBuilder[] | string[];
};
export class MessagePayload {
  options: MessageCreateOptions | string;
  body: any | null;
  files?: RawFile[];
  constructor(options: MessageCreateOptions | string) {
    this.options = options;
    this.body = null;
    this.files = undefined;
  }
  async resolveFiles(): Promise<RawFile[] | undefined> {
    if (this.files) return this.files;

    this.files = await Promise.all(
      //@ts-ignore
      this.options.files?.map((file) =>
        (this.constructor as unknown as typeof MessagePayload).resolveFile(file)
      ) ?? []
    );
    return this.files;
  }
  static async resolveFile(
    fileLike: BufferResolvable | Stream | JSONEncodable<AttachmentPayload>
  ): Promise<RawFile> {
    let attachment;
    let name;

    const findName = (thing) => {
      if (typeof thing === "string") {
        return basename(thing);
      }

      if (thing.path) {
        return basename(thing.path);
      }

      return "file.jpg";
    };

    const ownAttachment =
      typeof fileLike === "string" ||
      fileLike instanceof Buffer ||
      typeof (fileLike as Stream).pipe === "function";
    if (ownAttachment) {
      attachment = fileLike;
      name = findName(attachment);
    } else {
      //@ts-ignore
      attachment = fileLike.attachment;
      //@ts-ignore
      name = fileLike.name ?? findName(attachment);
    }

    const { data, contentType } = await DataResolver.resolveFile(attachment);
    return { data, name, contentType };
  }
  async resolveBody() {
    this.options =
      typeof this.options === "string"
        ? { content: this.options }
        : this.options;
    this.files = await this.resolveFiles();
    this.body = this.options;
    return this;
  }
}
