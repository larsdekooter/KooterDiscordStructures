import { ContextMenuCommandBuilder } from "@discordjs/builders";
import {
  ApplicationCommandType,
  InteractionType,
  Routes,
} from "discord-api-types/v10";
import { verifyKeyMiddleware } from "discord-interactions";
import e from "express";
import { Client } from "../dist/lib/Client.js";

const app = e();
const client = new Client(app, {
  clientPublicKey:
    "15b5e5ed368e4dc85a8d7e5056da3ae8dcfb404ab5b3ce4d9246a6806f8bd70a",
  route: "/interactions",
});
// app.post(
//   "/interactions",
//   verifyKeyMiddleware(
//     "15b5e5ed368e4dc85a8d7e5056da3ae8dcfb404ab5b3ce4d9246a6806f8bd70a"
//   ),
//   (req, res) => {
//     console.log(req.body.data.resolved);
//   }
// );

client.on("interactionCreate", (interaction) => {
  console.log("isCommand", interaction.isCommand());
  console.log("isContext", interaction.isContextMenuCommand());
  console.log("isMessage", interaction.isMessageContextMenuCommand());
  if (!interaction.isMessageContextMenuCommand()) return;
  console.log("Message", interaction.options.message);
});

client.login("");
app.listen(3000);
