import {
  APIChannelSelectComponent,
  ChannelType,
  ComponentType,
} from "discord-api-types/v10";
import { BaseSelectMenu } from "./BaseSelectMenu.js";

export class ChannelSelectMenu extends BaseSelectMenu<ComponentType.ChannelSelect> {
  channelTypes: ChannelType[];
  constructor(data: APIChannelSelectComponent) {
    super(data);
  }
}
