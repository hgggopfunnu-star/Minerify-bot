module.exports = {
    name: "cash",
    description: "Check your Rift coin balance",

    async execute(interaction, context) {
        const user = getUser(interaction.user.id, context);
        return interaction.reply(`💰 You have **${user.coins} Rift Coins**`);
    },

    async executePrefix(message, args, context) {
        const user = getUser(message.author.id, context);
        return message.reply(`💰 You have **${user.coins} Rift Coins**`);
    }
};

function getUser(userId, { balances }) {
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
