const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "embed",
    description: "Create a custom embed message (Admin Only)",
    options: [
        {
            name: "title",
            description: "Embed title",
            type: 3,
            required: true
        },
        {
            name: "description",
            description: "Embed description",
            type: 3,
            required: true
        },
        {
            name: "color",
            description: "Hex color (example: #00FFFF)",
            type: 3,
            required: false
        }
    ],

    async execute(interaction) {

        // 🔒 Admin check
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ You must be an Administrator to use this command.",
                ephemeral: true
            });
        }

        const title = interaction.options.getString("title");
        const description = interaction.options.getString("description");
        const color = interaction.options.getString("color") || "#00FFFF";

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: "Minerift Network" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
