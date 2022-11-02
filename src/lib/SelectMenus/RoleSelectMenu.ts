import { APIRoleSelectComponent, ComponentType } from "discord-api-types/v10";
import { BaseSelectMenu } from "./BaseSelectMenu.js";

export class RoleSelectMenu extends BaseSelectMenu<ComponentType.RoleSelect> {
  constructor(data: APIRoleSelectComponent) {
    super(data);
  }
}
