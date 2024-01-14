const { Client, Intents, MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`サーバーが起動しました。ポート番号：${port}`);
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const db = new sqlite3.Database('./blacklist.db');

db.run('CREATE TABLE IF NOT EXISTS user_blacklist (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL UNIQUE)');

client.commands = new Map();

const commands = [];
const commandFolders = ["bot","user","CREATOR"];

client.on('ready', async () => {
  console.log(`ログインしたアカウント：${client.user.tag}`);
  const guilds = client.guilds.cache.map(guild => guild.id);

  for (const folder of commandFolders) {
    const commandFiles = readdirSync(`./${folder}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`./${folder}/${file}`);
      commands.push(command.data.toJSON());

      client.commands.set(command.data.name, command);
    }
  }

  const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

  try {
    console.log('スラッシュコマンドの更新を開始しました(/)');

    for (const guildId of guilds) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildId),
        { body: commands },
      );
    }

    console.log('スラッシュコマンドの更新が正常に完了しました(/)');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const serverId = interaction.guildId;
  const userId = interaction.user.id;

  db.get('SELECT * FROM blacklist WHERE serverId = ?', [serverId], (err, serverRow) => {
    if (err) {
      console.error(err.message);
      return;
    }

    if (serverRow) {
      const supportButton = new MessageButton()
        .setStyle('LINK')
        .setLabel('サポートサーバーに参加')
        .setURL('https://discord.gg/wAk8AsAGE6');

      const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor('実行できません', 'https://b63bcd29-12c1-431c-a8ea-ba18d718ddb2-00-1yjzgqvntiwjd.pike.replit.dev/img/no.gif')
        .setDescription('このサーバーはブラックリストに登録されているためコマンドを実行できません')
        .setFooter('サポートが必要な場合は、サポートサーバーに参加してください。');

      return interaction.reply({ embeds: [embed], components: [new MessageActionRow().addComponents(supportButton)] });
    }

    db.get('SELECT * FROM user_blacklist WHERE userId = ?', [userId], (err, userRow) => {
      if (err) {
        console.error(err.message);
        return;
      }

      if (userRow) {
        const supportButton = new MessageButton()
          .setStyle('LINK')
          .setLabel('サポートサーバーに参加')
          .setURL('https://discord.gg/wAk8AsAGE6');

        const embed = new MessageEmbed()
          .setColor('RED')
          .setAuthor('実行できません', 'https://b63bcd29-12c1-431c-a8ea-ba18d718ddb2-00-1yjzgqvntiwjd.pike.replit.dev/img/no.gif')
          .setDescription('あなたはブラックリストに登録されているためコマンドを実行できません')
          .setFooter('サポートが必要な場合は、サポートサーバーに参加してください。');

        return interaction.reply({ embeds: [embed], components: [new MessageActionRow().addComponents(supportButton)] });
      }

      const command = client.commands.get(interaction.commandName);
      if (command) {
        try {
          command.execute(interaction);
        } catch (error) {
          console.error(error);
          const supportButton = new MessageButton()
            .setStyle('LINK')
            .setLabel('サポートサーバーに参加')
            .setURL('https://discord.gg/wAk8AsAGE6');

          const errorEmbed = new MessageEmbed()
            .setTitle('エラー')
            .setDescription('コマンドの実行中にエラーが発生しました。')
            .setColor('RED')
            .addFields({ name: 'エラー内容', value: `\`\`\`js\n${error.message || '不明なエラー'}\n\`\`\`` })
            .setFooter('サポートが必要な場合は、サポートサーバーに参加してください。');

          interaction.reply({ embeds: [errorEmbed], components: [new MessageActionRow().addComponents(supportButton)] });
        }
      }
    });
  });
});

const token = process.env.TOKEN;
client.login(token);
