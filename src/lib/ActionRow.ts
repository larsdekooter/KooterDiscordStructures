import {
  APIButtonComponent,
  APISelectMenuComponent,
  ComponentType,
} from "discord-api-types/v10";
import { Component } from "./Component.js";
import { findComponentType } from "./Util/Utils.js";
export type APIMessageComponentTypes =
  | APISelectMenuComponent
  | APIButtonComponent;

export class ActionRow<T extends Component> {
  type = ComponentType.ActionRow;
  components: T[];
  constructor(components: APIMessageComponentTypes[]) {
    this.components = components.map((component) => {
      return findComponentType(component);
    }) as unknown as T[];
  }
}
