const { SlashCommandBuilder } = require('discord.js');
const { getUserXP } = require('../../level/expSystem');

function expRequired(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('View your EXP and level'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const userXP = await getUserXP(userId);

            if (userXP) {
                const xpForNextLevel = expRequired(userXP.level + 1);
                await interaction.reply(`You are **level ${userXP.level}**, you have: **${userXP.xp}/${xpForNextLevel} exp**`);
            } else {
                await interaction.reply('No EXP data found for you.');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while fetching your EXP data.');
        }
    },
};
