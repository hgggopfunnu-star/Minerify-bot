const { EmbedBuilder } = require("discord.js");

/* ===========================
   ROLE IDS (SrMod + Admin)
=========================== */

const ALLOWED_ROLES = [
    "1475506943089971204", // SrMod
    "1475506943089971205"  // Admin
];

const LOG_CHANNEL_ID = "1477308559216873555";

module.exports = {
    name: "kick",
    description: "Kick a member from the server",

    async executePrefix(message, args) {

        // Permission check
        if (!message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
            return message.reply("❌ You do not have permission to use this command.");
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply("⚠ Please mention a user to kick.");
        }

        if (!target.kickable) {
            return message.reply("❌ I cannot kick this user. They may have higher permissions.");
        }

        const reason = args.slice(1).join(" ");
        if (!reason) {
            return message.reply("⚠ Please provide a reason for the kick.");
        }

        await target.kick(reason);

        await message.reply(`👢 ${target.user.tag} has been kicked.\nReason: **${reason}**`);

        const logEmbed = new EmbedBuilder()
            .setColor("DarkRed")
            .setTitle("👢 Member Kicked")
            .addFields(
                { name: "User", value: `${target.user.tag} (${target.id})` },
                { name: "Moderator", value: `${message.author.tag}` },
                { name: "Reason", value: reason }
            )
            .setTimestamp();

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        }
    }
};
