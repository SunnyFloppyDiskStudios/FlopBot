const fs = require('node:fs');
const path = require('node:path');

const xpFilePath = path.join(__dirname, 'exp.json');
let xpData = require(xpFilePath);

const levelRoles = {
    1: "1299900428041060382",
    5: "1299838147386937419",
    20: "1299838266769674240",
    50: "1299838339834318889",
    100: "1299838414828605450"
};

const cooldowns = new Map();
const COOLDOWN_TIME = 3000;

function expRequired(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

function getUserXP(userId) {
    return xpData[userId] || { xp: 0, level: 1 };
}

function addXP(userId) {
    const now = Date.now();
    if (cooldowns.has(userId) && now - cooldowns.get(userId) < COOLDOWN_TIME) {
        return false;
    }
    cooldowns.set(userId, now);

    if (!xpData[userId]) {
        xpData[userId] = { xp: 0, level: 1 };
    }
    xpData[userId].xp += 1;

    let currentLevel = xpData[userId].level;
    while (xpData[userId].xp >= expRequired(currentLevel + 1)) {
        currentLevel++;
    }

    if (currentLevel > xpData[userId].level) {
        xpData[userId].level = currentLevel;
        fs.writeFileSync(xpFilePath, JSON.stringify(xpData, null, 2));
        return true;
    }

    fs.writeFileSync(xpFilePath, JSON.stringify(xpData, null, 2));
    return false;
}

async function assignRole(guild, userId, member) {
    const level = xpData[userId].level;
    if (levelRoles[level]) {
        const roleId = levelRoles[level];
        try {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
            }
        } catch (error) {
            console.error('Error assigning role:', error);
        }
    }
}

async function sendLevelUpMessage(guild, userId, level) {
    const levelUpChannelID = '1299836842291499141';
    let channel = guild.channels.cache.get(levelUpChannelID);

    if (!channel) {
        try {
            channel = await guild.channels.fetch(levelUpChannelID);
        } catch (error) {
            console.error("Error fetching level-up channel:", error);
            return;
        }
    }

    if (channel && typeof channel.send === 'function') {
        try {
            await channel.send(`<@${userId}>, you have reached **level ${level}** and received the <@&${levelRoles[level]}> role!`);
        } catch (error) {
            console.error("Failed to send level up message:", error);
        }
    } else {
        console.error("Level-up channel not found or cannot send messages.");
    }
}

module.exports = { getUserXP, addXP, assignRole, sendLevelUpMessage };
