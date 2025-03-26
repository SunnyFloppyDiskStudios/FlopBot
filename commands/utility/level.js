const { SlashCommandBuilder } = require('discord.js');
const { getUserXP } = require('../../level/expSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('View your EXP and level'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const userXP = await getUserXP(userId);

            if (userXP) {
                await interaction.reply(`Your current level is ${userXP.level} and you have ${userXP.xp} XP.`);
            } else {
                await interaction.reply('No EXP data found for you.');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while fetching your EXP data.');
        }
    },
};
