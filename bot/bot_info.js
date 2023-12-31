const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot_info')
        .setDescription('BOTに関しての情報'),
    async execute(interaction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('サポートサーバー')
                    .setStyle('LINK')
                    .setURL('https://discord.gg/sVHEjvBBsB')
                    .setEmoji('🔗')
            )
            .addComponents(
                new MessageButton()
                    .setLabel('GitHub')
                    .setStyle('LINK')
                    .setURL('https://github.com/sift732/SAKA-BOT-Node.js')
                    .setEmoji('🔨')
            );

        const embed = new MessageEmbed()
            .setTitle('botの情報')
            .addFields(
                { name: '製作者', value: 'dark.guide', inline: false },
                { name: 'ID', value: '963063650413842452', inline: false },
                { name: 'bot作成日', value: `<t:1703949600:F>`, inline: false },
                { name: 'bot作成言語', value: 'JavaScript', inline: false },
                { name: '主要モジュール', value: `discord.js : ${require('discord.js').version}`, inline: false },
                { name: 'スラッシュコマンド', value: `slashcommandbuilder : ${require('@discordjs/builders').version}`, inline: false },
                { name: '導入数', value: `${interaction.client.guilds.cache.size}`, inline: false },
                { name: '累計メンバー数', value: `${interaction.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`, inline: false }
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
