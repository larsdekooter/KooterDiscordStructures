import {
  APIMentionableSelectComponent,
  ComponentType,
} from "discord-api-types/v10";
import { BaseSelectMenu } from "./BaseSelectMenu.js";

export class MentionableSelectMenu extends BaseSelectMenu<ComponentType.MentionableSelect> {
  constructor(data: APIMentionableSelectComponent) {
    super(data);
  }
}
