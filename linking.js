const { PermissionsBitField } = require("discord.js");

const linkCodes = new Map();
const linkedAccounts = new Map();

function setupLinking(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(" ");
    const command = args.shift()?.toLowerCase();

    // ADMIN: Generate code
    if (command === "!generatecode") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

      const mcUsername = args[0];
      if (!mcUsername) return message.reply("Provide Minecraft username.");

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      linkCodes.set(code, mcUsername);

      setTimeout(() => {
        linkCodes.delete(code);
      }, 5 * 60 * 1000);

      return message.reply(`Generated link code for ${mcUsername}: ${code}`);
    }

    // LINK COMMAND
    if (command === "!link") {
      const code = args[0];
      if (!code) return message.reply("Provide a linking code.");

      if (!linkCodes.has(code)) {
        return message.reply("Invalid or expired code.");
      }

      const mcUsername = linkCodes.get(code);

      linkedAccounts.set(message.author.id, mcUsername);
      linkCodes.delete(code);

      const role = message.guild.roles.cache.find(r => r.name === "Verified");
      if (role) {
        await message.member.roles.add(role);
      }

      return message.reply(`✅ Successfully linked with Minecraft account: ${mcUsername}`);
    }
  });
}

module.exports = { setupLinking };
