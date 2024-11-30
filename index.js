const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName('join')
    .setDescription('join'),
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
  console.log(`Hello!, ${client.user.tag}`);

  try {
    console.log('join');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands.map((command) => command.toJSON()) }
    );
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== 'join') return;

  const member = interaction.member;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({ content: 'Please join a voice channel.', ephemeral: true });
  }

  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    interaction.reply({ content: `Ready! Joined ${voiceChannel.name}`, ephemeral: true });

    setTimeout(() => {
      const audioPlayer = createAudioPlayer();
      const audioFilePath = path.join('audio.mp3');
      const resource = createAudioResource(audioFilePath);

      audioPlayer.play(resource);
      connection.subscribe(audioPlayer);

      console.log('Joined channel');
    }, 5000);
  } catch (error) {
    console.error(error);
    interaction.reply({ content: 'Failed to join channel *sad trombone*', ephemeral: true });
  }
});

client.login(process.env.TOKEN);
