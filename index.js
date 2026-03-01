const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    PermissionsBitField
} = require("discord.js");

const express = require("express");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

/* ================= DATABASE ================= */

const db = new Database("rift.db");

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    coins INTEGER DEFAULT 0,
    last_daily INTEGER DEFAULT 0
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS links (
    code TEXT PRIMARY KEY,
    minecraft TEXT,
    discord TEXT
)
`).run();

/* ================= CLIENT ================= */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

/* ================= SLASH COMMANDS ================= */

const commands = [

    new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Link Minecraft account")
        .addStringOption(opt =>
            opt.setName("code").setDescription("Link code").setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your Rift coins"),

    new SlashCommandBuilder()
        .setName("hunt")
        .setDescription("Hunt mobs for Rift coins"),

    new SlashCommandBuilder()
        .setName("mine")
        .setDescription("Mine blocks for Rift coins"),

    new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim daily reward")

].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
    );
})();

/* ================= READY ================= */

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

/* ================= AUTO IP ================= */

client.on("messageCreate", message => {
    if (message.author.bot) return;
    if (message.content.toLowerCase() === "ip") {
        message.reply("🔥 Minerift IP: **minerift.duckdns.org:25568**");
    }
});

/* ================= INTERACTIONS ================= */

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const userId = interaction.user.id;

    let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
        db.prepare("INSERT INTO users (id, coins, last_daily) VALUES (?,0,0)").run(userId);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    }

    /* ===== VERIFY ===== */

    if (interaction.commandName === "verify") {
        const code = interaction.options.getString("code");

        const link = db.prepare("SELECT * FROM links WHERE code = ?").get(code);

        if (!link) {
            return interaction.reply({ content: "❌ Invalid code.", ephemeral: true });
        }

        db.prepare("UPDATE links SET discord = ? WHERE code = ?")
            .run(userId, code);

        await interaction.reply({
            content: `✅ Linked with **${link.minecraft}**`,
            ephemeral: true
        });
    }

    /* ===== BALANCE ===== */

    if (interaction.commandName === "balance") {
        await interaction.reply(`💰 You have **${user.coins} Rift Coins**`);
    }

    /* ===== HUNT ===== */

    if (interaction.commandName === "hunt") {
        const reward = Math.floor(Math.random() * 100) + 20;
        db.prepare("UPDATE users SET coins = coins + ? WHERE id = ?")
            .run(reward, userId);

        await interaction.reply(`🏹 You hunted mobs and earned **${reward} Rift Coins**!`);
    }

    /* ===== MINE ===== */

    if (interaction.commandName === "mine") {
        const reward = Math.floor(Math.random() * 80) + 10;
        db.prepare("UPDATE users SET coins = coins + ? WHERE id = ?")
            .run(reward, userId);

        await interaction.reply(`⛏️ You mined resources and earned **${reward} Rift Coins**!`);
    }

    /* ===== DAILY ===== */

    if (interaction.commandName === "daily") {
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;

        if (now - user.last_daily < cooldown) {
            return interaction.reply({
                content: "⏳ You already claimed daily reward.",
                ephemeral: true
            });
        }

        const reward = 500;

        db.prepare(`
            UPDATE users 
            SET coins = coins + ?, last_daily = ? 
            WHERE id = ?
        `).run(reward, now, userId);

        await interaction.reply(`🎁 You claimed **${reward} Rift Coins**!`);
    }
});

/* ================= API FOR MINECRAFT ================= */

app.post("/generate-code", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "No username provided" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    db.prepare("INSERT INTO links (code, minecraft, discord) VALUES (?,?,NULL)")
        .run(code, username);

    res.json({ code });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});

client.login(TOKEN);
