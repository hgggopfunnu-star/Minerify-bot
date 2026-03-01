require("dotenv").config();
const express = require("express");
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    EmbedBuilder 
} = require("discord.js");

const app = express();
app.use(express.json());

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

/* ===========================
   ENVIRONMENT VARIABLES
=========================== */

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error("Missing environment variables.");
    process.exit(1);
}

/* ===========================
   MINERIFT CONFIG
=========================== */

const SERVER_IP = "play.minerift.fun";
const SERVER_STORE = "store.minerift.fun";

/* ===========================
   MEMORY STORAGE
=========================== */

const pendingLinks = new Map();
const linkedAccounts = new Map();
const balances = new Map();

/* ===========================
   EXPRESS API
=========================== */

app.get("/", (req, res) => {
    res.send("⚡ Minerift API Online ⚡");
});

app.post("/generate-code", (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Username required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingLinks.set(code, username);

    console.log(`Generated code ${code} for ${username}`);
    res.json({ code });
});

/* ===========================
   SLASH COMMANDS
=========================== */

const commands = [
    {
        name: "verify",
        description: "Link your Minecraft account",
        options: [
            {
                name: "code",
                description: "Code from /link in Minecraft",
                type: 3,
                required: true
            }
        ]
    },
    { name: "balance", description: "Check your Rift coins" },
    { name: "mine", description: "Mine blocks for Rift coins" },
    { name: "hunt", description: "Hunt mobs for Rift coins" },
    { name: "ip", description: "Get Minerift server IP" }
];

/* ===========================
   REGISTER COMMANDS
=========================== */

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        console.log("Slash commands registered.");
    } catch (err) {
        console.error(err);
    }
})();

/* ===========================
   BOT READY
=========================== */

client.once("ready", () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

/* ===========================
   INTERACTIONS
=========================== */

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const userId = interaction.user.id;

    /* ===== VERIFY ===== */

    if (interaction.commandName === "verify") {
        const code = interaction.options.getString("code");

        if (!pendingLinks.has(code)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❌ Invalid Code")
                        .setDescription("That code is invalid or expired.")
                ],
                ephemeral: true
            });
        }

        const mcUser = pendingLinks.get(code);
        pendingLinks.delete(code);

        linkedAccounts.set(userId, mcUser);
        if (!balances.has(userId)) balances.set(userId, 0);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Account Linked!")
                    .setDescription(`Minecraft account **${mcUser}** successfully linked.`)
            ]
        });
    }

    /* ===== BALANCE ===== */

    if (interaction.commandName === "balance") {
        const bal = balances.get(userId) || 0;

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("💰 Minerift Balance")
                    .setDescription(`You have **${bal} Rift Coins**`)
            ]
        });
    }

    /* ===== MINE ===== */

    if (interaction.commandName === "mine") {
        const reward = Math.floor(Math.random() * 20) + 5;
        const newBal = (balances.get(userId) || 0) + reward;
        balances.set(userId, newBal);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle("⛏ Mining Success!")
                    .setDescription(`You mined valuable ores and earned **${reward} Rift Coins**!\n\nNew Balance: **${newBal}**`)
            ]
        });
    }

    /* ===== HUNT ===== */

    if (interaction.commandName === "hunt") {
        const reward = Math.floor(Math.random() * 25) + 10;
        const newBal = (balances.get(userId) || 0) + reward;
        balances.set(userId, newBal);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Purple")
                    .setTitle("🏹 Hunting Victory!")
                    .setDescription(`You defeated mobs and earned **${reward} Rift Coins**!\n\nNew Balance: **${newBal}**`)
            ]
        });
    }

    /* ===== IP COMMAND (UNIQUE STYLE) ===== */

    if (interaction.commandName === "ip") {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#00FFFF")
                    .setTitle("🌍 Join Minerift Lifesteal")
                    .setDescription(
                        `⚡ **Server IP:** \`${SERVER_IP}\`\n\n` +
                        `🛒 Store: ${SERVER_STORE}\n\n` +
                        `💎 Lifesteal • PvP • Events • Custom Features\n\n` +
                        `🔥 Join now and dominate the Rift!`
                    )
                    .setFooter({ text: "Minerift Network" })
            ]
        });
    }
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
    console.log(`⚡ API running on port ${PORT}`);
});

client.login(TOKEN);
