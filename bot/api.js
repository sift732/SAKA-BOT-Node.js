const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('error_description')
    .setDescription('エラーの詳細を表示します'),

  async execute(interaction) {
    const options = [
      { label: 'DiscordAPIError : Missing Access', value: 'channel_related' },
      { label: 'DiscordAPIError : Two factor is required for this operation', value: '2fa_related' },
      { label: 'DiscordAPIError : Cannot send messages to this user', value: 'user_related' },
      { label: 'DiscordAPIError : Missing Permissions', value: 'permission_related' },
      { label: 'その他', value: 'other'},
    ];

    const selectMenu = new MessageSelectMenu()
      .setCustomId('エラーメッセージを選択してください')
      .setPlaceholder('詳細を選択してください')
      .addOptions(options);

    const row = new MessageActionRow().addComponents(selectMenu);

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('エラーの詳細を選択してください')

    await interaction.reply({ content: 'エラーメッセージを選択してください。', components: [row], embeds: [embed] });

    const filter = i => i.customId === 'エラーメッセージを選択してください' && i.isSelectMenu();
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      let selectedEmbed = null;

      switch (i.values[0]) {
        case 'channel_related':
          selectedEmbed = createChannelRelatedEmbed();
          break;
        case '2fa_related':
          selectedEmbed = createTwoFactorAuthEmbed();
          break;
        case 'user_related':
          selectedEmbed = createUserRelatedEmbed();
          break;
        case 'permission_related':
          selectedEmbed = createPermissionRelatedEmbed();
          break;
        case 'other':
          selectedEmbed = createOtherEmbed();
          break;
        default:
          break;
      }

      if (selectedEmbed) {
        await i.update({ embeds: [selectedEmbed], components: [] });
      } else {
        await i.update({ content: 'エラーの詳細が見つかりませんでした。', components: [] });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp('タイムアウトしました。');
      }
    });
  },
};

function createChannelRelatedEmbed() {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle('DiscordAPIError: Missing Access')
    .setDescription('チャンネルにアクセスできない。botのロールを一番上にしてみてください');
}

function createTwoFactorAuthEmbed() {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle('DiscordAPIError: Two factor is required for this operation')
    .setDescription('2段階認証していたら実行できない操作です');
}

function createUserRelatedEmbed() {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle('DiscordAPIError: Cannot send messages to this user')
    .setDescription('ユーザーIDが間違っている、またはユーザーが見つからない');
}

function createPermissionRelatedEmbed() {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle('DiscordAPIError: Missing Permissions')
    .setDescription('botが権限にアクセスできない。botのロールを一番上にしてみてください');
}

function createOtherEmbed() {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle('その他')
    .setDescription('サポートサーバーに参加してください');
}
