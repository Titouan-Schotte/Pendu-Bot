const {MessageEmbed, Client, Collection} = require('discord.js'),
    {MessageButton, MessageMenu, MessageMenuOption, MessageActionRow} = require('discord-buttons'),
    bot = new Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']}),
    words = require('./words.json'),
    config = require('./config.json'),
    start = require('./commands/new.js'),
    fs = require('fs');

require('discord-buttons')(bot)
bot.commands = new Collection();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


bot.on('ready', () => {
    console.log("Logged as " +bot.user.tag)
    const statuses = [
        'p#new to play',
        'p#help for help'
    ]

    let i = 0
    setInterval(() => {
        bot.user.setActivity(statuses[i], {type: 'PLAYING'})
        i = ++i % statuses.length

    }, 1e4)
})

fs.readdir('./commands', (err, files) => {
    if (err) throw err
    files.forEach(file => {
        if (!file.endsWith('.js')) return
        const command = require(`./commands/${file}`)
        bot.commands.set(command.name, command)
    })
})
bot.on('message', async message => {
    if (message.type !== 'DEFAULT' || message.author.bot) return
    const args = message.content.trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    if (!commandName.startsWith(config.PREFIX)) return
    const command = bot.commands.get(commandName.slice(config.PREFIX.length))
    if (!command) return
    command.run(message, args, bot)
})

bot.on('clickMenu', async option => {
    await option.reply.defer()

    switch(option.values.toString()){
        case 'easy':
            option.message.channel.send('🟢 Niveau Facile');
            break;
        case 'medium':
            option.message.channel.send('🟠 Niveau Moyen');
            break;
        case 'hard':
            option.message.channel.send('🔴 Niveau Difficile');
            break;
    }
})

bot.on('clickButton', async button => {
    await button.reply.defer()
    switch(button.id){
        case 'restart':
            button.message.delete()
            start.restart(button)
            break;
        case 'stop':
            button.message.delete()
            break;
    }
})
// process.on('uncaughtException', function(err) {
//     console.log('Caught exception: ' + err);
// });

bot.login('ODY0ODQ4MDE4NjgyMjgyMDA0.YO7aew.NonXOPdoKEqWYJ5ZdkrHV79pcVE')
