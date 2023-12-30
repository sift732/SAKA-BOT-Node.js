const { Client, Intents, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Map();

const commands = [];
const commandFolders = ["bot"];

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
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(chalk.red(error));
    const errorEmbed = new MessageEmbed()
      .setTitle('エラー')
      .setDescription('コマンドの実行中にエラーが発生しました。')
      .setColor('RED')
      .addFields({ name: 'エラー内容', value: `\`\`\`js\n${error.message || '不明なエラー'}\n\`\`\`` });
    await interaction.reply({ embeds: [errorEmbed]});
  }
});

const token = process.env.TOKEN;
client.login(token);
