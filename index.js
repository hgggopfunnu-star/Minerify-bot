require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    REST,
    Routes
} = require("discord.js");

const app = express();
app.use(express.json());

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
   DISCORD CLIENT
=========================== */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

/* ===========================
   CONFIG
=========================== */

const PREFIX = "rift";
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
   LOAD FEATURES
=========================== */

const features = new Map();
const commands = [];

const featuresPath = path.join(__dirname, "features");

if (fs.existsSync(featuresPath)) {
    const featureFiles = fs.readdirSync(featuresPath).filter(file => file.endsWith(".js"));

    for (const file of featureFiles) {
        const feature = require(`./features/${file}`);

        if (!feature.name || !feature.description) continue;

        features.set(feature.name, feature);

        // Slash command registration
        if (feature.execute) {
            commands.push({
                name: feature.name,
                description: feature.description,
                options: feature.options || []
            });
        }
    }
}

/* ===========================
   READY + REGISTER SLASH
=========================== */

client.once("ready", async () => {
    try {
        const rest = new REST({ version: "10" }).setToken(TOKEN);

        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log("Slash commands registered.");
        console.log(`🤖 Logged in as ${client.user.tag}`);
    } catch (err) {
        console.error(err);
    }
});

/* ===========================
   SLASH INTERACTIONS
=========================== */

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const feature = features.get(interaction.commandName);
    if (!feature || !feature.execute) return;

    try {
        await feature.execute(interaction, {
            pendingLinks,
            linkedAccounts,
            balances,
            SERVER_IP,
            SERVER_STORE
        });
    } catch (error) {
        console.error(error);
        if (!interaction.replied) {
            await interaction.reply({
                content: "There was an error executing this command.",
                ephemeral: true
            });
        }
    }
});

/* ===========================
   PREFIX COMMAND SYSTEM
=========================== */

client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (!message.content.toLowerCase().startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const feature = features.get(commandName);
    if (!feature || !feature.executePrefix) return;

    try {
        await feature.executePrefix(message, args, {
            pendingLinks,
            linkedAccounts,
            balances,
            SERVER_IP,
            SERVER_STORE
        });
    } catch (err) {
        console.error(err);
        message.reply("There was an error executing that command.");
    }
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
    console.log(`⚡ API running on port ${PORT}`);
});

client.login(TOKEN);
