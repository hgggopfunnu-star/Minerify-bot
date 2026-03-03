const cooldowns = new Map();

module.exports = {
    name: "rift",

    async executePrefix(message, args, { balances }) {
        if (!args[0]) {
            return message.reply("Usage: `rift cash | daily | hunt | inventory`");
        }

        const sub = args[0].toLowerCase();
        const user = getUser(message.author.id, balances);

        if (sub === "cash") {
            return message.reply(`💰 You have **${user.coins} Rift Coins**`);
        }

        if (sub === "daily") {
            return handleDaily(message.author.id, message.reply.bind(message), balances);
        }

        if (sub === "hunt") {
            const reward = Math.floor(Math.random() * 50) + 10;
            user.coins += reward;

            return message.reply(
                `🏹 You went hunting!\n💰 Earned **${reward} Rift Coins**\nNew Balance: **${user.coins}**`
            );
        }

        if (sub === "inventory") {
            if (Object.keys(user.inventory).length === 0) {
                return message.reply("🎒 Your inventory is empty.");
            }

            const items = Object.entries(user.inventory)
                .map(([item, qty]) => `${item} x${qty}`)
                .join("\n");

            return message.reply(`🎒 **Your Inventory**\n${items}`);
        }

        return message.reply("Unknown subcommand.");
    }
};

function getUser(userId, balances) {
    if (!balances.has(userId)) {
        balances.set(userId, {
            coins: 0,
            inventory: {},
            xp: 0,
            level: 1
        });
    }

    return balances.get(userId);
}

function handleDaily(userId, reply, balances) {
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (cooldowns.has(userId)) {
        const expiration = cooldowns.get(userId) + cooldown;
        if (now < expiration) {
            const minutes = Math.ceil((expiration - now) / 60000);
            return reply(`⏳ Try again in ${minutes} minutes.`);
        }
    }

    const user = getUser(userId, balances);
    user.coins += 100;

    cooldowns.set(userId, now);

    return reply(`🎁 You received **100 Rift Coins**!\nNew Balance: **${user.coins}**`);
}
