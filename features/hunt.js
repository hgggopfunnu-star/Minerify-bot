const cooldowns = new Map();

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const lootTable = [
    { name: "🐺 Wolf Fang", chance: 40 },
    { name: "🦴 Ancient Bone", chance: 30 },
    { name: "🩸 Blood Crystal", chance: 20 },
    { name: "👑 Rift Relic", chance: 10 }
];

function getRandomLoot() {
    const roll = random(1, 100);
    let cumulative = 0;

    for (const item of lootTable) {
        cumulative += item.chance;
        if (roll <= cumulative) return item.name;
    }

    return null;
}

module.exports = {
    name: "hunt",
    description: "Go hunting for coins and loot",

    async execute(interaction, { balances }) {
        const userId = interaction.user.id;
        return handleHunt(userId, interaction.reply.bind(interaction), balances);
    },

    async executePrefix(message, args, { balances }) {
        const userId = message.author.id;
        return handleHunt(userId, message.reply.bind(message), balances);
    }
};

async function handleHunt(userId, reply, balances) {
    const now = Date.now();
    const cooldownTime = 15 * 1000; // 15 seconds

    if (cooldowns.has(userId)) {
        const expiration = cooldowns.get(userId) + cooldownTime;
        if (now < expiration) {
            const timeLeft = ((expiration - now) / 1000).toFixed(1);
            return reply(`⏳ Wait ${timeLeft}s before hunting again.`);
        }
    }

    const coins = random(20, 60);
    const loot = getRandomLoot();

    const newBalance = (balances.get(userId) || 0) + coins;
    balances.set(userId, newBalance);

    cooldowns.set(userId, now);

    return reply(
        `🏹 You went hunting!\n\n` +
        `💰 Earned: **${coins} Rift Coins**\n` +
        `🎒 Loot: **${loot}**\n\n` +
        `New Balance: **${newBalance}**`
    );
}
