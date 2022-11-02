import { parse } from "path";
import { Collection } from "@discordjs/collection";
import { Stream } from "node:stream";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { Snowflake } from "discord-api-types/globals";
import { RawFile } from "@discordjs/rest";
import {
  APIActionRowComponent,
  APIMessageActionRowComponent,
  ComponentType,
  InteractionType,
} from "discord-api-types/v10";
import { Button } from "../Button.js";
import * as Menus from "../SelectMenus/index.js";
import {
  BaseSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "../SelectMenuInteraction.js";
import { Client } from "../Client.js";
import { Response } from "./HTTPTypes.js";
import { Interaction } from "../Interaction.js";
const isObject = (d: any) => typeof d === "object" && d !== null;

function flattenFunc(obj: any, ...props: any[]) {
  if (!isObject(obj)) return obj;

  const objProps = Object.keys(obj)
    .filter((k) => !k.startsWith("_"))
    .map((k) => ({ [k]: true }));

  props = objProps.length
    ? //@ts-ignore
      Object.assign(...objProps, ...props)
    : Object.assign({}, ...props);

  const out = {};

  for (let [prop, newProp] of Object.entries(props)) {
    if (!newProp) continue;
    newProp = newProp === true ? prop : newProp;

    const element = obj[prop];
    const elemIsObj = isObject(element);
    const valueOf =
      elemIsObj && typeof element.valueOf === "function"
        ? element.valueOf()
        : null;
    const hasToJSON = elemIsObj && typeof element.toJSON === "function";

    // If it's a Collection, make the array of keys
    if (element instanceof Collection)
      //@ts-ignore
      out[newProp] = Array.from(element.keys());
    // If the valueOf is a Collection, use its array of keys
    else if (valueOf instanceof Collection)
      //@ts-ignore
      out[newProp] = Array.from(valueOf.keys());
    // If it's an array, call toJSON function on each element if present, otherwise flatten each element
    else if (Array.isArray(element))
      //@ts-ignore
      out[newProp] = element.map((e) => e.toJSON?.() ?? flattenFunc(e));
    // If it's an object with a primitive `valueOf`, use that value
    //@ts-ignore
    else if (typeof valueOf !== "object") out[newProp] = valueOf;
    // If it's an object with a toJSON function, use the return value of it
    //@ts-ignore
    else if (hasToJSON) out[newProp] = element.toJSON();
    // If element is an object, use the flattened version of it
    //@ts-ignore
    else if (typeof element === "object") out[newProp] = flattenFunc(element);
    // If it's a primitive
    //@ts-ignore
    else if (!elemIsObj) out[newProp] = element;
  }

  return out;
}

function basenameFunc(path?: any, ext?: any) {
  const res = parse(path);
  return ext && res.ext.startsWith(ext) ? res.name : res.base.split("?")[0];
}

export const basename = basenameFunc;
export const flatten = flattenFunc;

export const resolveFiles = async (
  resource: BufferResolvable | Stream,
  name = "unknown.png",
  description: string | undefined = "description"
): Promise<RawFile> => {
  if (Buffer.isBuffer(resource)) return { data: resource, name };
  //@ts-ignore
  if (typeof resource[Symbol.asyncIterator] === "function") {
    const buffers = [];
    //@ts-ignore
    for (const data of resource) buffers.push(Buffer.from(data));
    return { data: Buffer.concat(buffers), name };
  }

  if (typeof resource === "string") {
    if (/^https?:\/\//.test(resource)) {
      const res = await fetch(resource);
      return {
        data: Buffer.from(await res.arrayBuffer()),
        contentType: res.headers.get("content-type") ?? undefined,
        name,
      };
    }

    const file = path.resolve(resource);

    return { data: fs.readFileSync(file), name };
  }
  throw new Error("Typ incorrect");
};

export function calculateGravity(
  r: number = 6.4e6, //6,4 * 10⁶
  G: number = 6.67e-11, //6,67 * 10⁻¹¹
  M: number = 6.0e24 //6,0 * 10²⁴
) {
  const { pow } = Math; // Get the pow function to use exponents (first parameter is the x (1), second is the y (²))
  const Fz = (G * M) / pow(r, 2); // Fz === Fg = mg === G * (mM / r²) = g ==== G * (M / r²);
  return Fz;
}

export function verifyBotOwner(id: Snowflake) {
  return id === "697045560527552552";
}

type BufferResolvable = Buffer | string;
type ResolvedFile = {
  data: Buffer;
  name: string;
  description: string;
  contentType?: string;
};

export function findComponentType(component: APIMessageActionRowComponent) {
  switch (component.type) {
    case ComponentType.Button: {
      return new Button(component);
      break;
    }
    case ComponentType.ChannelSelect: {
      return new Menus.ChannelSelectMenu(component);
      break;
    }
    case ComponentType.MentionableSelect: {
      return new Menus.MentionableSelectMenu(component);
      break;
    }
    case ComponentType.RoleSelect: {
      return new Menus.RoleSelectMenu(component);
      break;
    }
    case ComponentType.StringSelect: {
      return new Menus.StringSelectMenu(component);
      break;
    }
    case ComponentType.UserSelect: {
      return new Menus.UserSelectMenu(component);
      break;
    }
  }
}

export function findSelectMenuInteractionType(
  res: Response,
  interaction: any,
  client: Client
) {
  // console.log(interaction.data.componentType, ComponentType);
  switch (interaction.data.component_type) {
    case ComponentType.ChannelSelect: {
      return new ChannelSelectMenuInteraction(res, interaction, client);
      break;
    }
    case ComponentType.MentionableSelect: {
      return new MentionableSelectMenuInteraction(res, interaction, client);
      break;
    }
    case ComponentType.RoleSelect: {
      return new RoleSelectMenuInteraction(res, interaction, client);
      break;
    }
    case ComponentType.StringSelect: {
      return new StringSelectMenuInteraction(res, interaction, client);
      break;
    }
    case ComponentType.UserSelect: {
      return new UserSelectMenuInteraction(res, interaction, client);
      break;
    }
    default:
      return new BaseSelectMenuInteraction(res, interaction, client);
      break;
  }
}

export function interactionIsSelectMenuInteraction(
  componentType: ComponentType
) {
  const type = componentType;
  return (
    type === ComponentType.ChannelSelect ||
    type === ComponentType.MentionableSelect ||
    type === ComponentType.RoleSelect ||
    type === ComponentType.StringSelect ||
    type === ComponentType.UserSelect
  );
}
