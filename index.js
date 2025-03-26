const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const { addXP, assignRole } = require('./level/expSystem');
const messageFetcher = require('./messageFetcher');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');

const commandFolders = fs.readdirSync(foldersPath).filter(folder =>
    folder !== '.DS_Store' && fs.statSync(path.join(foldersPath, folder)).isDirectory()
);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);

    if (fs.existsSync(commandsPath) && fs.statSync(commandsPath).isDirectory()) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file !== '.DS_Store');

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') && file !== '.DS_Store');

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const xpAdded = addXP(userId);
    if (xpAdded) {
        const member = await message.guild.members.fetch(userId);
        await assignRole(message.guild, userId, member);
    }

    await messageFetcher.execute(message);
});

client.login(token);
