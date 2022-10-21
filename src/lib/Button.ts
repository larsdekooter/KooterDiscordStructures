import {
  APIButtonComponent,
  APIButtonComponentWithCustomId,
  APIButtonComponentWithURL,
} from "discord-api-types/v10";
import { Component } from "./Component.js";

export class Button extends Component {
  constructor(data: APIButtonComponent) {
    super(data);
  }
  get style() {
    return (this.data as APIButtonComponent).style;
  }
  get label() {
    return (this.data as APIButtonComponent).label;
  }
  get emoji() {
    return (this.data as APIButtonComponent).emoji ?? null;
  }
  get disabled() {
    return (this.data as APIButtonComponent).disabled ?? null;
  }
  get cutomId() {
    return (this.data as APIButtonComponentWithCustomId).custom_id ?? null;
  }
  get url() {
    return (this.data as APIButtonComponentWithURL).url ?? null;
  }
}
