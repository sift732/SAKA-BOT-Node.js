const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./blacklist.db');

let blacklistedServers = [];

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS blacklist (serverId TEXT PRIMARY KEY)');
  db.all('SELECT * FROM blacklist', (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    blacklistedServers = rows.map(row => row.serverId);
  });
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adblack')
    .setDescription('サーバーをブラックリストに追加します。')
    .addStringOption(option =>
      option.setName('server_id')
        .setDescription('ブラックリストに追加するサーバーのID。')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== '963063650413842452') {
      return interaction.reply('このコマンドは制作者専用です。');
    }

    const serverId = interaction.options.getString('server_id');

    if (blacklistedServers.includes(serverId)) {
      return interaction.reply('このサーバーは既にブラックリストに登録されています。');
    }

    db.run('INSERT INTO blacklist (serverId) VALUES (?)', [serverId], err => {
      if (err) {
        console.error(err.message);
        return interaction.reply('エラーが発生しました。');
      }

      blacklistedServers.push(serverId);

      return interaction.reply(`サーバー \`${serverId}\` がブラックリストに追加されました。`);
    });
  },
};
