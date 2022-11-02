import {
  APISelectMenuComponent,
  APIStringSelectComponent,
} from "discord-api-types/v10";
import { Component } from "./Component.js";

/**
 * @deprecated Will be removed in the next major version
 */
export class SelectMenu extends Component {
  constructor(data: APISelectMenuComponent) {
    super(data);
  }
  get placeholder() {
    return (this.data as APISelectMenuComponent).placeholder ?? null;
  }
  get maxValues() {
    return (this.data as APISelectMenuComponent).max_values ?? null;
  }
  get minValues() {
    return (this.data as APISelectMenuComponent).min_values ?? null;
  }
  get customId() {
    return (this.data as APISelectMenuComponent).custom_id ?? null;
  }
  get disabled() {
    return (this.data as APISelectMenuComponent).disabled ?? null;
  }
  get options() {
    return (this.data as APIStringSelectComponent).options ?? null;
  }
}
