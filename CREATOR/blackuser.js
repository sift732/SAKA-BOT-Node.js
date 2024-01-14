const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./blacklist.db');

db.run('CREATE TABLE IF NOT EXISTS user_blacklist (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL UNIQUE)');

const creatorId = '963063650413842452';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adblack_user')
    .setDescription('指定したユーザーIDをブラックリストに登録します')
    .addStringOption(option => 
      option.setName('登録するユーザー')
        .setDescription('ブラックリストに登録するユーザーのID')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== creatorId) {
      return interaction.reply('このコマンドは制作者のみが実行できます。');
    }

    const userId = interaction.options.getString('登録するユーザー');

    db.get('SELECT * FROM user_blacklist WHERE userId = ?', [userId], (err, userRow) => {
      if (err) {
        console.error(err.message);
        return interaction.reply('ブラックリストの確認中にエラーが発生しました');
      }

      if (userRow) {
        return interaction.reply('指定されたユーザーはすでにブラックリストに登録されています。');
      }

      db.run('INSERT INTO user_blacklist (userId) VALUES (?)', [userId], function(err) {
        if (err) {
          console.error(err.message);
          return interaction.reply('ブラックリストへの追加中にエラーが発生しました');
        }

        console.log(`User ID ${userId} has been blacklisted with ID ${this.lastID}`);
        interaction.reply(`ユーザーID ${userId} がブラックリストに追加されました。`);
      });
    });
  },
};
