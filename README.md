# KooterDiscordStructures

A package to use with the Discord API, mostly oriëntated around http-interaction bots. Works currently only with express, but that might change

# Installation

```
npm install kooterdiscordstructures
```

# Example Usage

Get the main part running

```js
import express from 'express';
import { Client } from 'kooterdiscordstructures';

const app = express();
const client = new Client(app, { clientPublicKey: 'your client public key', route: 'the route where discord sends the interaction to' });
client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    };
})l

// Optional, but this will safe you a few requests before replying to the interaction.
// This fetch all the guilds your bot is in, and all the bots channels
// More guilds = more channels = more request, so be carefull with it.
// (discord.js/rest will wait until the ratelimit is over, so if you do do it, startup might take a while)
client.login('your-bot-token');

app.listen(8000, () => console.log('App listening at http://localhost:3000'))
```
