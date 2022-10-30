import path from "path";
import fs from "fs/promises";
import { Stream } from "stream";
import fetch from "node-fetch";

type BufferResolvable = Buffer | string;
interface ResolvedFile {
  data: Buffer;
  contentType?: string;
}

export class DataResolver {
  static async resolveFile(
    resource: BufferResolvable | Stream
  ): Promise<ResolvedFile> {
    if (Buffer.isBuffer(resource)) {
      return { data: resource };
    }

    if (typeof resource[Symbol.asyncIterator] === "function") {
      const buffers: Buffer[] = [];
      //@ts-ignore
      for await (const data of resource) buffers.push(Buffer.from(data));
      return { data: Buffer.concat(buffers) };
    }

    if (typeof resource === "string") {
      if (/^https?:\/\//.test(resource)) {
        const res = await fetch(resource);
        return {
          data: Buffer.from(await res.arrayBuffer()),
          contentType: res.headers.get("content-type") ?? undefined,
        };
      }

      const file = path.resolve(resource);
      const stats = await fs.stat(file);
      if (!stats.isFile()) throw new Error("File not found");
      return { data: await fs.readFile(file) };
    }

    throw new Error("Unknown error");
  }
  static async resolveImage(image: BufferResolvable) {
    if (!image) return null;
    if (typeof image === "string" && image.startsWith("data:")) return image;
    const file = await (this.constructor as typeof DataResolver).resolveFile(
      image
    );
    return this.resolveBase64(file.data);
  }
  static resolveBase64(data: BufferResolvable) {
    if (Buffer.isBuffer(data))
      return `data:image/jpg;base64,${data.toString("base64")}`;
    return data;
  }
}
