const { EmbedBuilder } = require("discord.js");
const { getWarnings } = require("../memory");

const ALLOWED_ROLES = [
    "1475506943089971201", // Helper
    "1475506943089971203",
    "1475506943089971204",
    "1475506943089971205"
];

module.exports = {
    name: "warnings",
    description: "Check a user's warnings",

    async executePrefix(message, args) {

        if (!message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
            return message.reply("❌ You do not have permission.");
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply("⚠ Mention a user.");

        const total = getWarnings(message.guild.id, target.id);

        const embed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("📊 Warning Summary")
            .addFields(
                { name: "User", value: `${target.user.tag}` },
                { name: "Total Warnings", value: `${total}` }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
