const { status } = require("minecraft-server-util");

const SERVER_HOST = "pro.blockhost.cloud";
const SERVER_PORT = 25568;

module.exports = {
    name: "status",
    description: "Check Minerift server status",

    async execute(interaction) {
        return handleStatus(interaction.reply.bind(interaction));
    },

    async executePrefix(message) {
        return handleStatus(message.reply.bind(message));
    }
};

async function handleStatus(reply) {
    try {
        const response = await status(SERVER_HOST, SERVER_PORT);

        return reply(
            `🟢 **Server Online**\n\n` +
            `🌍 IP: \`${SERVER_HOST}:${SERVER_PORT}\`\n` +
            `👥 Players: **${response.players.online}/${response.players.max}**\n` +
            `📦 Version: **${response.version.name}**\n` +
            `📡 Ping: **${response.roundTripLatency}ms**`
        );

    } catch (err) {
        return reply(
            `🔴 **Server Offline**\n\n` +
            `🌍 IP: \`${SERVER_HOST}:${SERVER_PORT}\`\n` +
            `The server is unreachable.`
        );
    }
}
