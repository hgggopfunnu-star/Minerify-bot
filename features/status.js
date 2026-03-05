const { EmbedBuilder } = require("discord.js");
const util = require("minecraft-server-util");

const SERVER_IP = "pro.blockhost.cloud";
const SERVER_PORT = 25568;

module.exports = {
    name: "status",
    description: "Check the Minecraft server status",

    async executePrefix(message) {

        if (!message.content.toLowerCase().startsWith("froxen status")) return;

        try {

            const result = await util.status(SERVER_IP, SERVER_PORT);

            const players = result.players.sample
                ? result.players.sample.map(p => p.name).join(", ")
                : "No players listed";

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("🟢 ForxenMC Server Status")
                .addFields(
                    { name: "IP", value: "pro.blockhost.cloud:25568" },
                    { name: "Players", value: `${result.players.online}/${result.players.max}` },
                    { name: "Version", value: result.version.name },
                    { name: "Online Players", value: players }
                )
                .setFooter({ text: "ForxenMC Network" })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🔴 ForxenMC Server Offline")
                .setDescription("The Minecraft server is currently unreachable.")
                .setTimestamp();

            message.reply({ embeds: [embed] });

        }

    }
};
