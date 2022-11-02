import { APIUserSelectComponent, ComponentType } from "discord-api-types/v10";
import { BaseSelectMenu } from "./BaseSelectMenu.js";

export class UserSelectMenu extends BaseSelectMenu<ComponentType.UserSelect> {
  constructor(data: APIUserSelectComponent) {
    super(data);
  }
}
