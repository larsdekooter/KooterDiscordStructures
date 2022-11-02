import {
  ChannelType,
  ComponentType,
  TeamMemberMembershipState,
} from "discord-api-types/v10";
import { Client } from "./Client";
import { GuildChannel } from "./GuildChannel";
import { Member } from "./Member";
import { MessageComponentInteraction } from "./MessageComponentInteraction.js";
import { PermissionsBitField } from "./PermissionsBitField";
import { Role } from "./Role";
import { User } from "./User";
import { Response } from "./Util/HTTPTypes";

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
      [key: string]: Partial<User>;
    };
    members?: {
      [key: string]: Partial<Member>;
    };
  };
};

export type MentionableSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];

  resolved: {
    users: {
      [key: string]: Partial<User>;
    };
    members?: {
      [key: string]: Partial<Member>;
    };
    roles: {
      [key: string]: Partial<Role>;
    };
  };
};

export type RoleSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];

  resolved: {
    roles: {
      [key: string]: Partial<Role>;
    };
  };
};

export type ChannelSelectMenuInteractionData = {
  componentType: ComponentType;
  customId: string;
  values: string[];

  resolved: {
    channels: {
      [key: string]: Partial<GuildChannel>;
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
  }
}

export class UserSelectMenuInteraction extends BaseSelectMenuInteraction {
  data: UserSelectMenuInteractionData;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      resolved: interaction.data.resolved,
      values: interaction.data.values,
    };
  }
}
export class MentionableSelectMenuInteraction extends BaseSelectMenuInteraction {
  data: MentionableSelectMenuInteractionData;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      resolved: interaction.data.resolved,
      values: interaction.data.values,
    };
  }
}

export class RoleSelectMenuInteraction extends BaseSelectMenuInteraction {
  data: RoleSelectMenuInteractionData;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      resolved: interaction.data.resolved,
      values: interaction.data.values,
    };
  }
}

export class ChannelSelectMenuInteraction extends BaseSelectMenuInteraction {
  data: ChannelSelectMenuInteractionData;
  constructor(res: Response, interaction: any, client: Client) {
    super(res, interaction, client);
    this.data = {
      componentType: interaction.data.component_type,
      customId: interaction.data.custom_id,
      resolved: interaction.data.resolved,
      values: interaction.data.values,
    };
  }
}
