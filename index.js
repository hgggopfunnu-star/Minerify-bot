const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args.shift()?.toLowerCase();

  const logChannel = message.guild.channels.cache.find(
    ch => ch.name === "punishment-logs"
  );

  // STAFF CHECK
  if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    return;
  }

  // WARN
  if (command === "!warn") {
    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention a user to warn.");

    const reason = args.join(" ") || "No reason provided.";

    const embed = new EmbedBuilder()
      .setTitle("⚠️ User Warned")
      .setColor("Yellow")
      .addFields(
        { name: "User", value: `${user.user.tag}`, inline: true },
        { name: "Staff", value: `${message.author.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await user.send(`⚠️ You were warned in ${message.guild.name}\nReason: ${reason}`).catch(() => {});
    logChannel.send({ embeds: [embed] });
    message.reply("User warned successfully.");
  }

  // MUTE (Timeout 10 minutes default)
  if (command === "!mute") {
    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention a user to mute.");

    const reason = args.join(" ") || "No reason provided.";

    await user.timeout(10 * 60 * 1000, reason);

    const embed = new EmbedBuilder()
      .setTitle("🔇 User Muted")
      .setColor("Orange")
      .addFields(
        { name: "User", value: `${user.user.tag}`, inline: true },
        { name: "Staff", value: `${message.author.tag}`, inline: true },
        { name: "Duration", value: "10 minutes", inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await user.send(`🔇 You were muted in ${message.guild.name}\nReason: ${reason}`).catch(() => {});
    logChannel.send({ embeds: [embed] });
    message.reply("User muted for 10 minutes.");
  }

  // BAN
  if (command === "!ban") {
    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention a user to ban.");

    const reason = args.join(" ") || "No reason provided.";

    await user.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle("🔨 User Banned")
      .setColor("Red")
      .addFields(
        { name: "User", value: `${user.user.tag}`, inline: true },
        { name: "Staff", value: `${message.author.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
    message.reply("User banned successfully.");
  }
});

client.login(process.env.TOKEN);

