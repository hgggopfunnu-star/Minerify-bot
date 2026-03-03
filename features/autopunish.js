const { EmbedBuilder } = require("discord.js");

/* ===========================
   CONFIG
=========================== */

const LOG_CHANNEL_ID = "1477308559216873555";
const warnings = new Map();

/* ===========================
   TRACK WARNINGS
=========================== */

function addWarning(guild, member, moderator) {
    const key = `${guild.id}-${member.id}`;
    const count = (warnings.get(key) || 0) + 1;
    warnings.set(key, count);
    return count;
}

module.exports = {
    name: "autopunish",
    description: "Internal auto punishment handler",

    async executePrefix(message, args) {
        // Only trigger when command is warn
        if (!message.content.toLowerCase().startsWith("rift warn")) return;

        const target = message.mentions.members.first();
        if (!target) return;

        const totalWarnings = addWarning(message.guild, target, message.member);

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

        // 3 WARNINGS → MUTE
        if (totalWarnings === 3) {
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

            setTimeout(async () => {
                if (target.roles.cache.has(mutedRole.id)) {
                    await target.roles.remove(mutedRole);
                }
            }, 10 * 60 * 1000); // 10 minutes

            if (logChannel) {
                logChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Orange")
                            .setTitle("⚠ Auto Mute Triggered")
                            .setDescription(`${target.user.tag} reached 3 warnings and was muted for 10 minutes.`)
                            .setTimestamp()
                    ]
                });
            }
        }

        // 5 WARNINGS → KICK
        if (totalWarnings === 5) {
            if (target.kickable) {
                await target.kick("Reached 5 warnings.");

                if (logChannel) {
                    logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Red")
                                .setTitle("👢 Auto Kick Triggered")
                                .setDescription(`${target.user.tag} reached 5 warnings and was kicked.`)
                                .setTimestamp()
                        ]
                    });
                }
            }
        }

        // 7 WARNINGS → BAN
        if (totalWarnings === 7) {
            if (target.bannable) {
                await target.ban({ reason: "Reached 7 warnings." });

                if (logChannel) {
                    logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("DarkRed")
                                .setTitle("🔨 Auto Ban Triggered")
                                .setDescription(`${target.user.tag} reached 7 warnings and was banned.`)
                                .setTimestamp()
                        ]
                    });
                }
            }
        }
    }
};
