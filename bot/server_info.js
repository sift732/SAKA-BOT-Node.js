const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server_info')
    .setDescription('サーバーの情報を表示します'),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();

    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const memberCount = totalMembers - botCount;

    const rolesCount = guild.roles.cache.size;
    const invitesCount = (await guild.invites.fetch()).size;

    const createdDate = new Date(guild.createdTimestamp).toLocaleString('ja-JP');
    const elapsedTime = Math.floor((Date.now() - guild.createdTimestamp) / (1000 * 60 * 60 * 24));

    const embed = new MessageEmbed()
        .setTitle('サーバー情報')
        .addField('サーバー名', guild.name, true)
        .addField('サーバーID', guild.id, true)
        .addField('所有者', `<@${owner.user.id}>`, true)
        .addField('作成日', createdDate, true)
        .addField('招待リンク数', `${invitesCount.toString()}個`, true)
        .addField('メンバー数', `${totalMembers.toString()}名`, true)
        .addField('作成経過時間', `${elapsedTime}日`, true)
        .addField('ロール数', `${rolesCount.toString()}個`, true)
        .addField('メンバーとbotの割合', `メンバー: ${memberCount}｜Bot: ${botCount}`, true)
        .setColor('BLUE');

    await interaction.reply({ embeds: [embed] });
  },
};
