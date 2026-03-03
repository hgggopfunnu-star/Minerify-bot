const { clearWarnings } = require("../memory");

const ALLOWED_ROLES = [
    "1475506943089971204", // SrMod
    "1475506943089971205"  // Admin
];

module.exports = {
    name: "clearwarn",
    description: "Clear a user's warnings",

    async executePrefix(message, args) {

        if (!message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
            return message.reply("❌ You do not have permission.");
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply("⚠ Mention a user.");

        clearWarnings(message.guild.id, target.id);

        message.reply(`✅ Cleared warnings for ${target.user.tag}.`);
    }
};
