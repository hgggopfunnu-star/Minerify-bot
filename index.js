require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const {
    Client,
    GatewayIntentBits,
    REST,
    Routes
} = require("discord.js");

/* ===========================
   ENVIRONMENT VARIABLES
=========================== */

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const MONGO_URI = process.env.MONGO_URI;

if (!TOKEN || !CLIENT_ID || !GUILD_ID || !MONGO_URI) {
    console.error("Missing required environment variables.");
    process.exit(1);
}

/* ===========================
   EXPRESS APP
=========================== */

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("⚡ Minerift API Online ⚡");
});

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

const PREFIX = "rift ";
const SERVER_IP = "play.minerift.fun";
const SERVER_STORE = "store.minerift.fun";

/* ===========================
   DATABASE
=========================== */

let db;

async function connectMongo() {
    try {
        const mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
        db = mongoClient.db("minerift");

        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    }
}

/* ===========================
   LOAD FEATURES
=========================== */

const features = new Map();
const commands = [];

const featuresPath = path.join(__dirname, "features");

if (fs.existsSync(featuresPath)) {
    const files = fs.readdirSync(featuresPath).filter(file => file.endsWith(".js"));

    for (const file of files) {
        const feature = require(`./features/${file}`);

        if (!feature.name || !feature.description) continue;

        features.set(feature.name, feature);

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
   READY EVENT
=========================== */

client.once("ready", async () => {
    await connectMongo();

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
        console.error("Slash registration failed:", err);
    }
});

/* ===========================
   SLASH COMMAND HANDLER
=========================== */

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const feature = features.get(interaction.commandName);
    if (!feature || !feature.execute) return;

    try {
        await feature.execute(interaction, {
            db,
            SERVER_IP,
            SERVER_STORE
        });
    } catch (err) {
        console.error(err);

        if (!interaction.replied) {
            await interaction.reply({
                content: "There was an error executing this command.",
                ephemeral: true
            });
        }
    }
});

/* ===========================
   PREFIX COMMAND HANDLER
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
            db,
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
