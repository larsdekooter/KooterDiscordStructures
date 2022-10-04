import { APIEmbed } from "discord-api-types/v10";

export class Embed {
  data: APIEmbed;
  constructor(data: any) {
    this.data = { ...data };
  }
  get fields() {
    return this.data.fields ?? [];
  }
  get title() {
    return this.data.title ?? null;
  }
  get description() {
    return this.data.description ?? null;
  }
  get url() {
    return this.data.url ?? null;
  }
  get color() {
    return this.data.color ?? null;
  }
  get timestamp() {
    return this.data.timestamp ?? null;
  }
  get thumbnail() {
    if (!this.data.thumbnail) return null;
    return {
      url: this.data.thumbnail.url,
      proxyURL: this.data.thumbnail.proxy_url,
      height: this.data.thumbnail.height,
      width: this.data.thumbnail.width,
    };
  }
  get image(): null | {
    url: string;
    proxyURL: string;
    height: number;
    width: number;
  } {
    if (!this.data.image) return null;
    return {
      url: this.data.image.url,
      proxyURL: this.data.image.proxy_url as string,
      height: this.data.image.height as number,
      width: this.data.image.width as number,
    };
  }
  get video() {
    if (!this.data.video) return null;
    return {
      url: this.data.video.url as string,
      proxyURL: this.data.video.proxy_url as string,
      height: this.data.video.height,
      width: this.data.video.width,
    };
  }
  get author() {
    if (!this.data.author) return null;
    return {
      name: this.data.author.name,
      url: this.data.author.url,
      iconURL: this.data.author.icon_url,
      proxyIconURL: this.data.author.proxy_icon_url,
    };
  }
  get provider() {
    return this.data.provider ?? null;
  }
  get footer() {
    if (!this.data.footer) return null;
    return {
      text: this.data.footer.text,
      iconURL: this.data.footer.icon_url,
      proxyIconURL: this.data.footer.proxy_icon_url,
    };
  }
  get length() {
    return (
      (this.data.title?.length ?? 0) +
      (this.data.description?.length ?? 0) +
      (this.data.fields?.reduce(
        (prev, curr) => prev + curr.name.length + curr.value.length,
        0
      ) ?? 0) +
      (this.data.footer?.text.length ?? 0) +
      (this.data.author?.name.length ?? 0)
    );
  }
  get hexColor() {
    return typeof this.data.color === "number"
      ? `#${this.data.color.toString(16).padStart(6, "0")}`
      : this.data.color ?? null;
  }
  toJSON() {
    return { ...this.data };
  }
}
