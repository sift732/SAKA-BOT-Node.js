const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./blacklist.db');
const creatorId = '963063650413842452';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove_user')
    .setDescription('指定したユーザーIDをブラックリストから削除します')
    .addStringOption(option =>
      option.setName('削除するユーザー')
        .setDescription('ブラックリストから削除するユーザーのID')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== creatorId) {
      return interaction.reply('このコマンドは制作者のみが実行できます。');
    }

    const userId = interaction.options.getString('削除するユーザー');

    db.run('DELETE FROM user_blacklist WHERE userId = ?', [userId], function(err) {
      if (err) {
        console.error(err.message);
        return interaction.reply('ユーザーのブラックリストからの削除中にエラーが発生しました');
      }

      console.log(`User ID ${userId} has been removed from the user blacklist.`);
      interaction.reply(`ユーザーID ${userId} がブラックリストから削除されました。`);
    });
  },
};
