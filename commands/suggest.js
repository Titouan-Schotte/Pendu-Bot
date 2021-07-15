const {MessageEmbed, Client} = require('discord.js'),
    config = require('../config.json'), bot = new Client();
module.exports = {
    run: async (message, args) => {
        var embed = new MessageEmbed().setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL(), 'https://github.com/Titouan-Schotte').setColor(0xA52A2A).setTitle('Suggest').setTimestamp().setFooter('Bot créé par Titoune#1870').setDescription('Votre suggestion a été envoyé au développeur !\nMerci de votre coopération.').addField('Mot', args[0])
        console.log(args[0])
        message.channel.send(embed)

        embed = new MessageEmbed().setAuthor(message.author.username, message.author.avatarURL(), 'https://github.com/Titouan-Schotte').setColor(0xA52A2A).setTimestamp().addFields(
            {name: 'USER', value: message.author.username, inline: true},
            {name: 'USER ID', value: message.author.id, inline: true},
            {name: 'BOT', value: message.author.bot, inline: true},
            {name: 'GUILD SENDER', value: message.guild.name, inline: true},
            {name: 'GUILD ID', value: message.guild.id, inline: true},
            {name: '\u200B', value: '\u200B'},
        )
        console.log(`[SUGGEST] ${message.author.username} in ${message.guild.name} => ${args[0]}`)
    },
    name: "suggest"
}