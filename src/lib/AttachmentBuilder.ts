export type AttachmentData = {
  name?: string;
  description?: string;
};
type BufferResolvable = Buffer | string;
export class AttachmentBuilder {
  attachment: Buffer;
  name?: string;
  description?: string;
  constructor(attachment: BufferResolvable, data: AttachmentData = {}) {
    this.attachment = Buffer.from(attachment);
    this.name = data.name;
    this.description = data.description;
  }
}
