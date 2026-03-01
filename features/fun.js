module.exports = (client) => {

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'hello') {
            await interaction.reply('Hello from new feature file 😈');
        }

        if (interaction.commandName === 'coinflip') {
            const result = Math.random() > 0.5 ? "Heads" : "Tails";
            await interaction.reply(`🪙 ${result}`);
        }
    });

};
