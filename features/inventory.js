module.exports = {
    name: "inventory",
    description: "View your Rift inventory",

    async execute(interaction, { balances }) {
        return showInventory(interaction.user.id, interaction.reply.bind(interaction), balances);
    },

    async executePrefix(message, args, { balances }) {
        return showInventory(message.author.id, message.reply.bind(message), balances);
    }
};

function showInventory(userId, reply, balances) {
    const userData = balances.get(userId);

    if (!userData || !userData.inventory || Object.keys(userData.inventory).length === 0) {
        return reply("🎒 Your inventory is empty.");
    }

    let text = "🎒 **Your Inventory:**\n\n";

    for (const item in userData.inventory) {
        text += `${item} x${userData.inventory[item]}\n`;
    }

    return reply(text);
}
