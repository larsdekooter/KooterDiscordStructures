import { RawFile } from "@discordjs/rest";
import { APIMessage } from "discord-api-types/v10";
import { basename } from "./Util/Utils.js";
import { DataResolver } from "./DataResolver.js";
import { Stream } from "stream";
import { JSONEncodable } from "@discordjs/builders";

type BufferResolvable = Buffer | string;
interface AttachmentPayload {
  attachment: BufferResolvable | Stream;
  name?: string;
  description?: string;
}

export class MessagePayload {
  target;
  options;
  body: APIMessage | null;
  files?: RawFile[] | null;
  constructor(target, options) {
    this.target = target;
    this.options = options;
    this.body = null;
    this.files = null;
  }
  async resolveFiles(): Promise<RawFile[] | undefined> {
    if (this.files) return this.files;

    this.files = await Promise.all(
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
}
