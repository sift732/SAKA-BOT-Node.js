const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('コマンドのヘルプを表示します'),

  async execute(interaction) {

    const helpData = readHelpData();

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('コマンドヘルプ');

    helpData.forEach((command) => {
      embed.addField(
        command.name,
        command.description + (command.options ? `\nオプション ${command.options}` : ''),
        false
      );
    });

    await interaction.reply({ embeds: [embed] });
  },
};

function readHelpData() {
  try {
    const rawData = fs.readFileSync('help.json');
    const helpData = JSON.parse(rawData);
    return helpData.commands;
  } catch (error) {
    console.error('json読み込み中にエラーが発生しました：', error);
    return [];
  }
}
