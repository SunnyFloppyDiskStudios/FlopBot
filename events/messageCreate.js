module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;

        const args = message.content.trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = message.client.commands.get(commandName);

        if (!command) return;

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            message.reply('There was an error executing that command.').catch(console.error);
        }
    },
};
