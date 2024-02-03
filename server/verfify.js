const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify command')
    .addRoleOption((option) =>
      option.setName('role').setDescription('Role to assign').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('embedContent').setDescription('Embed Content').setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const embedContent = interaction.options.getString('embedContent');

    const db = new sqlite3.Database('your_database_file.db');
    db.run('INSERT INTO verification_settings (guildId, roleId, embedContent) VALUES (?, ?, ?)', [
      interaction.guild.id,
      role.id,
      embedContent,
    ]);
    db.close();

    await interaction.reply('Verification settings saved!');
  },
};
