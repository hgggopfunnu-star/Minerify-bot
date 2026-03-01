const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { setupLinking } = require("./linking");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= READY =================
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ================= LOAD LINKING SYSTEM =================
setupLinking(client);

// ================= MAIN MESSAGE HANDLER =================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args.shift()?.toLowerCase();

  const logChannel = message.guild.channels.cache.find(
    ch => ch.name === "punishment-logs"
  );

  // ================= SERVER IP AUTO RESPONSE =================
  const ipTriggers = ["ip", "server ip", "what is the ip", "mc ip"];

  if (ipTriggers.includes(message.content.toLowerCase())) {
    const embed = new EmbedBuilder()
      .setTitle("🌍 Minerift Network")
      .setColor("Purple")
      .setDescription("🎮 **Server IP:** `minerift.duckdns.org:25568`\n⚔️ Lifesteal SMP | Join the fight.")
      .setFooter({ text: "Minerift • Dominate the SMP 👑" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // ================= WARN =================
  if (command === "!warn") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("You don't have permission to warn.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user to warn.");

    const reason = args.join(" ") || "No reason provided.";

    const embed = new EmbedBuilder()
      .setTitle("⚠️ User Warned")
      .setColor("Orange")
      .addFields(
        { name: "User", value: `${member.user.tag}` },
        { name: "Moderator", value: `${message.author.tag}` },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    if (logChannel) logChannel.send({ embeds: [embed] });

    return message.reply(`${member.user.tag} has been warned.`);
  }

  // ================= BAN =================
  if (command === "!ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("You don't have permission to ban.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user to ban.");

    const reason = args.join(" ") || "No reason provided.";

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle("🔨 User Banned")
      .setColor("Red")
      .addFields(
        { name: "User", value: `${member.user.tag}` },
        { name: "Moderator", value: `${message.author.tag}` },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    if (logChannel) logChannel.send({ embeds: [embed] });

    return message.reply(`${member.user.tag} has been banned.`);
  }

  // ================= MUTE (TIMEOUT) =================
  if (command === "!mute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("You don't have permission to mute.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user to mute.");

    const duration = 10 * 60 * 1000; // 10 minutes
    const reason = args.slice(1).join(" ") || "No reason provided.";

    await member.timeout(duration, reason);

    const embed = new EmbedBuilder()
      .setTitle("🔇 User Muted")
      .setColor("Blue")
      .addFields(
        { name: "User", value: `${member.user.tag}` },
        { name: "Moderator", value: `${message.author.tag}` },
        { name: "Duration", value: "10 minutes" },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    if (logChannel) logChannel.send({ embeds: [embed] });

    return message.reply(`${member.user.tag} has been muted for 10 minutes.`);
  }
});

client.login(process.env.TOKEN);
