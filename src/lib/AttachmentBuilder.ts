export type AttachmentData = {
  name?: string;
  description?: string;
};
type BufferResolvable = Buffer | string;
export class AttachmentBuilder {
  attachment: BufferResolvable;
  name?: string;
  description?: string;
  constructor(attachment: BufferResolvable, data: AttachmentData = {}) {
    this.attachment = attachment;
    this.name = data.name;
    this.description = data.description;
  }
}
