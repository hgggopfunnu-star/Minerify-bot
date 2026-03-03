const { EmbedBuilder } = require("discord.js");

const cooldowns = new Map();

module.exports = {
    name: "daily",
    description: "Claim your daily Rift Coins",

    async execute(interaction, { balances }) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownTime = 24 * 60 * 60 * 1000;

        if (cooldowns.has(userId)) {
            const expiration = cooldowns.get(userId) + cooldownTime;

            if (now < expiration) {
                const timeLeft = Math.ceil((expiration - now) / 60000);
                return interaction.reply({
                    content: `⏳ You already claimed your daily reward. Try again in ${timeLeft} minutes.`,
                    ephemeral: true
                });
            }
        }

        const reward = 100;
        const newBalance = (balances.get(userId) || 0) + reward;

        balances.set(userId, newBalance);
        cooldowns.set(userId, now);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("🎁 Daily Reward")
                    .setDescription(
                        `You received **${reward} Rift Coins**!\n\nNew Balance: **${newBalance}**`
                    )
            ]
        });
    }
};
