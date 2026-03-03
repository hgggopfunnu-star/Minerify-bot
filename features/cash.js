module.exports = {
    name: "cash",
    description: "Check your Rift coin balance",

    async execute(interaction, { balances }) {
        const userId = interaction.user.id;
        const bal = balances.get(userId) || 0;

        return interaction.reply({
            content: `💰 You have **${bal} Rift Coins**`
        });
    },

    async executePrefix(message, args, { balances }) {
        const userId = message.author.id;
        const bal = balances.get(userId) || 0;

        return message.reply(`💰 You have **${bal} Rift Coins**`);
    }
};
