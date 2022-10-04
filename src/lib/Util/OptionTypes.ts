import { ApplicationCommandOptionType } from "discord-api-types/v10";

export type ResolvedOptions = {
  users?: { [key: string]: { id: string } };
  members?: { [key: string]: { user: {} } };
  roles?: { [key: string]: { id: string } };
  channels?: { [key: string]: { id: string } };
  messages?: { [key: string]: { id: string } };
  attachments?: { [key: string]: { id: string } };
};

export type Option<Type> = {
  type: ApplicationCommandOptionType;
  name: string;
  value: Type;
};
