const {MessageEmbed} = require('discord.js')
module.exports = {
    run : message => {
        var embed = new MessageEmbed().setAuthor(message.guild.me.user.username, message.guild.me.user.avatarURL(), 'https://github.com/Titouan-Schotte').setColor(0xA52A2A).setTitle('Help').setTimestamp().setFooter('Bot créé par Titoune#1870').addFields({name: '\u200B', value: '\u200B'},
            {name: 'New Game', value: 'p#new', inline: true},
            {name: 'Suggest Word', value: 'p#suggest <yourword>', inline: true},
            {name: '\u200B', value: '\u200B'},
        ).setDescription('Si vous rencontrez le moindre problème avec ce bot merci d\'en informer le propriétaire !')
        message.channel.send(embed)
    },
    name: "help"

}