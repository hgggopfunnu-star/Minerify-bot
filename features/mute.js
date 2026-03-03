const { EmbedBuilder, PermissionsBitField } = require("discord.js");

/* ===========================
   ROLE IDS
=========================== */

const ALLOWED_ROLES = [
    "1475506943089971203", // Moderator
    "1475506943089971204", // SrMod
    "1475506943089971205"  // Admin
];

const LOG_CHANNEL_ID = "1477308559216873555";

/* ===========================
   TIME PARSER
=========================== */

function parseDuration(input) {
    const match = input.match(/^(\d+)(m|h|d)$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    if (unit === "m") return value * 60 * 1000;
    if (unit === "h") return value * 60 * 60 * 1000;
    if (unit === "d") return value * 24 * 60 * 60 * 1000;

    return null;
}

module.exports = {
    name: "mute",
    description: "Mute a member temporarily",

    async executePrefix(message, args) {

        if (!message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
            return message.reply("❌ You do not have permission to use this command.");
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply("⚠ Please mention a user to mute.");

        const durationArg = args[1];
        if (!durationArg) return message.reply("⚠ Please provide a duration (e.g. 10m, 1h, 1d).");

        const duration = parseDuration(durationArg);
        if (!duration) return message.reply("⚠ Invalid duration format. Use 10m, 1h, or 1d.");

        const reason = args.slice(2).join(" ") || "No reason provided.";

        // Create Muted role if it doesn't exist
        let mutedRole = message.guild.roles.cache.find(r => r.name === "Muted");

        if (!mutedRole) {
            mutedRole = await message.guild.roles.create({
                name: "Muted",
                permissions: []
            });

            message.guild.channels.cache.forEach(async (channel) => {
                await channel.permissionOverwrites.edit(mutedRole, {
                    SendMessages: false,
                    AddReactions: false,
                    Speak: false
                });
            });
        }

        await target.roles.add(mutedRole);

        message.reply(`🔇 ${target.user.tag} has been muted for ${durationArg}.\nReason: **${reason}**`);

        const logEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("🔇 Member Muted")
            .addFields(
                { name: "User", value: `${target.user.tag} (${target.id})` },
                { name: "Moderator", value: `${message.author.tag}` },
                { name: "Duration", value: durationArg },
                { name: "Reason", value: reason }
            )
            .setTimestamp();

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        }

        // Auto unmute
        setTimeout(async () => {
            if (target.roles.cache.has(mutedRole.id)) {
                await target.roles.remove(mutedRole);

                const unmuteEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("🔊 Member Unmuted")
                    .addFields(
                        { name: "User", value: `${target.user.tag}` },
                        { name: "Duration Completed", value: durationArg }
                    )
                    .setTimestamp();

                if (logChannel) {
                    logChannel.send({ embeds: [unmuteEmbed] });
                }
            }
        }, duration);
    }
};
