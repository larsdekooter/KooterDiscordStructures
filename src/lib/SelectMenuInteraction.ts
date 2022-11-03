import { Collection } from "@discordjs/collection";
import {
  APIGuildChannel,
  APIGuildMember,
  APIRole,
  APIUser,
  ChannelType,
  ComponentType,
  TeamMemberMembershipState,
} from "discord-api-types/v10";
import { Client } from "./Client.js";
import { GuildChannel } from "./GuildChannel.js";
import { Member } from "./Member.js";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { PermissionsBitField } from "./PermissionsBitField.js";
import { Role } from "./Role.js";
import { User } from "./User.js";
import { findChannelType } from "./Util/Channel.js";
import { Response } from "./Util/HTTPTypes.js";
import { Channel } from "./Channel.js";

export type StringSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];
};

export type UserSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];

  resolved: {
    users: {
      [key: string]: APIUser;
    };
    members?: {
      [key: string]: APIGuildMember;
    };
  };
};

export type MentionableSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];

  resolved: {
    users: {
      [key: string]: APIUser;
    };
    members?: {
      [key: string]: APIGuildMember;
    };
    roles: {
      [key: string]: APIRole;
    };
  };
};

export type RoleSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];

  resolved: {
    roles: {
      [key: string]: APIRole;
    };
  };
};

export type ChannelSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];

  resolved: {
    channels: {
      [key: string]: APIGuildChannel<any>;
    };
  };
};

export type BaseSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];
};

export class BaseSelectMenuInteraction extends MessageComponentInteraction {
  data: BaseSelectMenuInteractionData;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    // console.log(interaction.data.component_type);
    this.data = {
      customId: interaction.data.custom_id,
      componentType: interaction.data.component_type,
      values: interaction.data.values,
    };
  }
}

export class StringSelectMenuInteraction extends BaseSelectMenuInteraction {
  values: string[];
  data: StringSelectMenuInteractionData;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      values: interaction.data.values,
    };
    this.values = this.data.values;
  }
}

export class UserSelectMenuInteraction extends BaseSelectMenuInteraction {
  data: UserSelectMenuInteractionData;
  users: Collection<string, User>;
  members: Collection<string, Member>;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      resolved: interaction.data.resolved,
      values: interaction.data.values,
    };
    this.users = new Collection();
    this.members = new Collection();
    for (const user of Object.values(this.data.resolved.users)) {
      this.users.set(user.id, new User(user, this.client));
    }
    if (this.data.resolved.members) {
      for (const [id, member] of Object.entries(this.data.resolved.members)) {
        const user = this.data.resolved.users[id];
        if (!user) {
          this.client.emit(
            "debug",
            `Recieved a member without user, skipping ${id}`
          );

          continue;
        }
        member.user = user;
        const m = new Member(member, this.guild!.id, this.client);
        this.members.set(id, m);
        this.guild?.members.cache.set(id, m);
      }
    }
  }
}
export class MentionableSelectMenuInteraction extends BaseSelectMenuInteraction {
  data: MentionableSelectMenuInteractionData;
  roles: Collection<string, Role>;
  members: Collection<string, Member>;
  users: Collection<string, User>;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      resolved: interaction.data.resolved,
      values: interaction.data.values,
    };
    this.roles = new Collection();
    this.members = new Collection();
    this.users = new Collection();
    const { users, members, roles } = this.data.resolved ?? {};
    if (users) {
      for (const user of Object.values(users)) {
        this.users.set(user.id, new User(user, this.client));
      }
    }

    if (members) {
      for (const [id, member] of Object.entries(members)) {
        const user = this.data.resolved.users[id];
        if (!user) {
          this.client.emit(
            "debug",
            `Recieved a member without user, skipping ${id}`
          );

          continue;
        }
        member.user = user;
        const m = new Member(member, this.guild?.id as string, this.client);
        this.members.set(id, m);
        this.guild?.members.cache.set(id, m);
      }
    }
    if (roles) {
      for (const role of Object.values(roles)) {
        this.roles.set(role.id, new Role(role, this.guild!));
      }
    }
  }
}

export class RoleSelectMenuInteraction extends BaseSelectMenuInteraction {
  data: RoleSelectMenuInteractionData;
  roles: Collection<string, Role>;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      resolved: interaction.data.resolved,
      values: interaction.data.values,
    };
    this.roles = new Collection();
    for (const role of Object.values(this.data.resolved.roles)) {
      this.roles.set(role.id, new Role(role, this.guild!));
    }
  }
}

export class ChannelSelectMenuInteraction extends BaseSelectMenuInteraction {
  data: ChannelSelectMenuInteractionData;
  channels: Collection<string, Channel>;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      resolved: interaction.data.resolved,
      values: interaction.data.values,
    };
    this.channels = new Collection();
    for (let apiChannel of Object.values(this.data.resolved.channels)) {
      const channel = findChannelType(apiChannel, this.client);
      this.channels.set(channel.id, channel);
    }
  }
}
