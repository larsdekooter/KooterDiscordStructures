import {
  APIButtonComponent,
  APISelectMenuComponent,
  ComponentType,
} from "discord-api-types/v10";
import { Button } from "./Button.js";
import { Component } from "./Component.js";
import { SelectMenu } from "./SelectMenu.js";
export type APIMessageComponentTypes =
  | APISelectMenuComponent
  | APIButtonComponent;

export class ActionRow<T extends Component> {
  type: ComponentType.ActionRow;
  components: T[];
  constructor(components: APIMessageComponentTypes[]) {
    this.components = components.map((component) => {
      return component.type === ComponentType.Button
        ? new Button(component)
        : component.type === ComponentType.SelectMenu
        ? new SelectMenu(component)
        : new Component(component);
    }) as T[];
  }
}
