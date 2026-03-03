const { EmbedBuilder } = require("discord.js");

/* ===========================
   ROLE IDS
=========================== */

const ALLOWED_ROLES = [
    "1475506943089971201", // Helper
    "1475506943089971203", // Moderator
    "1475506943089971204", // SrMod
    "1475506943089971205"  // Admin
];

const LOG_CHANNEL_ID = "1477308559216873555";

module.exports = {
    name: "warn",
    description: "Warn a member",

    async executePrefix(message, args) {
        // Check permission
        if (!message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
            return message.reply("❌ You do not have permission to use this command.");
        }

        // Get mentioned user
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply("⚠ Please mention a user to warn.");
        }

        // Get reason
        const reason = args.slice(1).join(" ");
        if (!reason) {
            return message.reply("⚠ Please provide a reason for the warning.");
        }

        // Confirmation message
        await message.reply(`⚠ ${target.user.tag} has been warned.\nReason: **${reason}**`);

        // Create log embed
        const logEmbed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("⚠ Member Warned")
            .addFields(
                { name: "User", value: `${target.user.tag} (${target.id})` },
                { name: "Moderator", value: `${message.author.tag}` },
                { name: "Reason", value: reason }
            )
            .setTimestamp();

        // Send to log channel
        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        }
    }
};
