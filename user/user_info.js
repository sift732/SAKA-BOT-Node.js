const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { format } = require('date-fns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user_info')
    .setDescription('ユーザーの情報を表示します')
    .addUserOption(option =>
      option.setName('ユーザー')
        .setDescription('情報を表示するユーザー')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('ユーザー') || interaction.user;

    const joinDate = targetUser.joinedAt ? format(targetUser.joinedAt, "yyyy年MM月dd日") ("HH:mm:ss") : '不明';
          
    const registrationDate = format(targetUser.createdAt, "yyyy年MM月dd日 HH:mm:ss");

    const clientType = getClientType(targetUser);

    const activity = targetUser.presence?.activities.length
      ? targetUser.presence.activities[0].name
      : 'なし';

    const rolesCount = interaction.guild.members.cache.get(targetUser.id).roles.cache.size;

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${targetUser.username} の情報`)
      .addFields(
        { name: 'ユーザー名', value: targetUser.username, inline: true },
        { name: 'ユーザーID', value: targetUser.id, inline: true },
        { name: 'サーバー参加日', value: joinDate, inline: true },
        { name: 'Discord登録日', value: registrationDate, inline: true },
        { name: 'ログイン機種', value: clientType, inline: true },
        { name: 'アクティビティ', value: activity, inline: true },
        { name: 'ニックネーム', value: targetUser.nickname || 'なし', inline: true },
        { name: '付与されているロール数', value: rolesCount.toString(), inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};

function getClientType(user) {
  if (user.bot) {
    return 'Bot';
  }

  const activities = user.presence?.activities;
  if (activities && activities.length > 0) {
    const platform = activities[0].platform;
    if (platform === 'web') {
      return 'ブラウザ';
    } else if (platform === 'desktop') {
      return 'PC';
    } else if (platform === 'mobile') {
      return 'スマホ';
    }
  }
  return '不明';
}
