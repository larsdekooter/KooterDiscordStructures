import {
  APISelectMenuOption,
  APIStringSelectComponent,
  ComponentType,
} from "discord-api-types/v10";
import { BaseSelectMenu } from "./BaseSelectMenu.js";

export class StringSelectMenu extends BaseSelectMenu<ComponentType.StringSelect> {
  options: APISelectMenuOption[];
  constructor(data: APIStringSelectComponent) {
    super(data);
    this.options = data.options;
  }
}
