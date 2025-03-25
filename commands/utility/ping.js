module.exports = {
    data: { name: 'ping' },
    execute(message, args) {
        message.reply('Pong!');
    },
};