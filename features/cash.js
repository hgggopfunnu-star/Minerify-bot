module.exports = {
    name: "cash",
    description: "Check your Rift coin balance",

    async execute(interaction, { balances }) {
        const user = getUser(interaction.user.id, balances);
        return interaction.reply(`💰 You have **${user.coins} Rift Coins**`);
    },

    async executePrefix(message, args, { balances }) {
        const user = getUser(message.author.id, balances);
        return message.reply(`💰 You have **${user.coins} Rift Coins**`);
    }
};

function getUser(userId, balances) {
    if (!balances.has(userId) || typeof balances.get(userId) === "number") {
        balances.set(userId, {
            coins: typeof balances.get(userId) === "number" ? balances.get(userId) : 0,
            inventory: {},
            xp: 0,
            level: 1
        });
    }

    return balances.get(userId);
}
