import { APIMessageComponent } from "discord-api-types/v10";

export class Component {
  data: APIMessageComponent;
  constructor(data: APIMessageComponent) {
    this.data = data;
  }
}
