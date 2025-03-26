const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');

function extractMessageIds(url) {
    const match = url.match(/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/);
    return match ? { channelId: match[1], messageId: match[2] } : null;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const urls = message.content.match(/https?:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/g);
        if (!urls) return;

        for (const url of urls) {
            const ids = extractMessageIds(url);
            if (!ids) continue;

            const channel = await message.client.channels.fetch(ids.channelId).catch(() => null);
            if (!channel || !channel.isTextBased()) continue;

            const botPermissions = channel.permissionsFor(message.client.user);
            if (!botPermissions || !botPermissions.has(PermissionsBitField.Flags.ViewChannel) || !botPermissions.has(PermissionsBitField.Flags.ReadMessageHistory)) {
                console.log(`[WARNING] Missing read permissions in #${channel.name}`);
                continue;
            }

            const linkedMessage = await channel.messages.fetch(ids.messageId).catch(() => null);
            if (!linkedMessage) continue;

            const filteredContent = linkedMessage.content.replace(/https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)/gi, '[Image removed]');

            const embed = new EmbedBuilder()
                .setColor(0x6b5fff)
                .setAuthor({ name: linkedMessage.author.tag, iconURL: linkedMessage.author.displayAvatarURL() })
                .setDescription(filteredContent || '*[No text content]*')
                .setTimestamp(linkedMessage.createdAt)
                .setFooter({ text: `From #${channel.name}` });

            const currentChannelPermissions = message.channel.permissionsFor(message.client.user);
            if (!currentChannelPermissions.has(PermissionsBitField.Flags.SendMessages)) {
                console.log(`[WARNING] Missing permission to reply in #${message.channel.name}`);
                continue;
            }

            try {
                await message.reply({ embeds: [embed] });
            } catch (error) {
                console.error(`[ERROR] Failed to send reply: ${error.message}`);
            }
        }
    }
};
