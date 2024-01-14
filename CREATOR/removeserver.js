const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./blacklist.db');
const creatorId = '963063650413842452';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove_server')
    .setDescription('指定したサーバーIDをブラックリストから削除します')
    .addStringOption(option =>
      option.setName('削除するサーバー')
        .setDescription('ブラックリストから削除するサーバーのID')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== creatorId) {
      return interaction.reply('このコマンドは制作者のみが実行できます。');
    }

    const serverId = interaction.options.getString('削除するサーバー');

    db.run('DELETE FROM blacklist WHERE serverId = ?', [serverId], function(err) {
      if (err) {
        console.error(err.message);
        return interaction.reply('サーバーのブラックリストからの削除中にエラーが発生しました');
      }

      console.log(`Server ID ${serverId} has been removed from the blacklist.`);
      interaction.reply(`サーバーID ${serverId} がブラックリストから削除されました。`);
    });
  },
};
