import {
  APIBaseSelectMenuComponent,
  ComponentType,
} from "discord-api-types/v10";
import { Component } from "../Component.js";

export class BaseSelectMenu<
  T extends
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect
> extends Component {
  customId: string;
  disabled: boolean;
  maxValues?: number;
  minValues?: number;
  placeholder?: string;
  type: T;
  constructor(data: APIBaseSelectMenuComponent<any>) {
    super(data);
    this.customId = data.custom_id;
    this.disabled = data.disabled ?? false;
    this.maxValues = data.max_values;
    this.minValues = data.min_values;
    this.placeholder = data.placeholder;
    this.type = data.type;
  }
}
