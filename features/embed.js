const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "embed",
    description: "Create a custom embed message",
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
