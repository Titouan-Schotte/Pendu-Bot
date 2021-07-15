const {MessageEmbed, Client, Collection} = require('discord.js'), {
        MessageButton,
        MessageMenu,
        MessageMenuOption,
        MessageActionRow
    } = require('discord-buttons'), bot = new Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']}),
    words = require('../words.json'), config = require('../config.json'), fs = require('fs');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
module.exports = {
    run: async message => {
        if (!message.author.bot) {
            var embed = new MessageEmbed()
                .setTitle('Nouvelle Partie')
                .setColor(0x964B00)
                .setDescription('Vous êtes sur le point de débuter une nouvelle partie\n\n:arrow_forward: __Sélectionnez un niveau de difficulter :__')
                .setTimestamp().setFooter('Partie de ' + message.author.tag)

            let option1 = new MessageMenuOption().setLabel('Facile').setEmoji('🟢').setValue('easy').setDescription('mot de 3 à 6 lettres'),
                option2 = new MessageMenuOption().setLabel('Moyenne').setEmoji('🟠').setValue('medium').setDescription('mot de 3 à 10 lettres'),
                option3 = new MessageMenuOption().setLabel('Difficile').setEmoji('🔴').setValue('hard').setDescription('mot de 6 à 25 lettres');

            let options = [option1, option2, option3]
            let select = new MessageMenu()
                .setID('commandmenu')
                .setPlaceholder('Selectionnez le niveau de difficulté')
                .setMaxValues(1)
                .setMinValues(1)
                .addOptions(options)

            var mespartie = await message.channel.send(embed, select)
            mespartie.channel.awaitMessages(m => m.author.bot == true, {
                max: 1,
                time: 1000000,
                errors: ['time']
            }).then(async messages => {
                var messagediff = messages.first(),
                    difficultie = messagediff.content.split(' ')[2]
                //Difficulté
                switch (difficultie) {
                    case "Facile":
                        var kwords = words.WORDS.EASY,
                            word = kwords[Math.floor(Math.random() * kwords.toString().split(',').length)], essaies = 10
                        break;
                    case "Moyen":
                        var kwords = words.WORDS.EASY + ',' + words.WORDS.MEDIUM,
                            word = kwords.toString().split(',')[Math.floor(Math.random() * kwords.toString().split(',').length)],
                            essaies = 9
                        break;
                    case "Difficile":
                        var kwords = words.WORDS.MEDIUM + ',' + words.WORDS.HARD,
                            word = kwords.toString().split(',')[Math.floor(Math.random() * kwords.toString().split(',').length)],
                            essaies = 8
                        break;
                }
                // Affichage
                var affichage = "", lettrestrouvees = ""
                for (let l = 0; l < word.length; l++) {
                    if (word[l] != " " && word[l] != "-") {
                        affichage += "* "
                    }
                    if (word[l] == " ") {
                        affichage += " "
                    }
                    if (word[l] == "-") {
                        affichage += "- "
                    }
                }
                embed.setTitle('Pendu').setColor(0x582900).setDescription('\n\n:chart_with_upwards_trend: Niveau de Difficulté :\n```' + difficultie + '``` \n :incoming_envelope: Essaies Restants : ```' + essaies + '```\n :lock: Mot à trouver : \n```' + affichage + '```\n\n**Proposez 1 lettre** ')

                await delay(1000).then(messagediff.delete())
                await mespartie.delete()
                mespartie = await message.channel.send(embed)
                const filteruser = m => m.author.id == message.author.id,
                    optionuser = {max: 1, time: 1000000, errors: ['time']}
                //Proposition

                console.log(`[NEW GAME] ${message.author.tag} in ${message.guild.name} \\ ${difficultie} => ${word}`)
                while (essaies > 0) {
                    await mespartie.channel.awaitMessages(filteruser, optionuser).then(async messagesprop => {
                        var mesprop = messagesprop.first()
                        if (mesprop.content == '#pendu') {
                            var meswarning = await mesprop.channel.send(':warning: **Demande de partie rejetée** \nVeuillez ne pas lancer 2 parties en même temps !')
                            await mesprop.delete()
                            await mespartie.delete()
                            essaies = 0
                        }
                        if (mesprop.content != '#pendu') {
                            if (!isNaN(mesprop.content) || mesprop.content.length > 1) {
                                var meswarning = await mesprop.channel.send(':warning: Veuillez entrer uniquement **1** lettre :warning:')
                                await mesprop.delete()
                            }
                            if (isNaN(mesprop.content) && mesprop.content.length == 1) {
                                try {
                                    meswarning.delete()
                                } catch (e) {
                                }                            //Lettre Trouvee
                                if (word.indexOf(mesprop.content.toLowerCase()) != -1) {
                                    lettrestrouvees += mesprop.content.toLowerCase()
                                    affichage = "";

                                    for (let x = 0; x < word.length; x++) {
                                        if (lettrestrouvees.indexOf(word[x]) != -1) {
                                            affichage += word[x] + " "
                                        } else {
                                            if (word[x] != " " && word[x] != "-") {
                                                affichage += "* "
                                            }
                                            if (word[x] == " ") {
                                                affichage += " "
                                            }
                                            if (word[x] == "-") {
                                                affichage += "- "
                                            }
                                        }
                                    }
                                    embed.setTitle('Pendu').setColor(0x00ff00).setDescription(':incoming_envelope: Essaies Restants : ```' + essaies + '```\n :lock: Mot à trouver : \n```' + affichage + '```\n\n:white_check_mark: Lettre "**' + mesprop.content + '**" trouvée !\n\n**Proposez 1 lettre** ')
                                    mespartie.edit(embed)
                                    mesprop.delete()


                                } else {
                                    essaies -= 1
                                    embed.setTitle('Pendu').setColor(0xff0000).setDescription(':incoming_envelope: Essaies Restants : ```' + essaies + '```\n :lock: Mot à trouver : \n```' + affichage + '```\n\n❌ Lettre "**' + mesprop.content + '**" inexistante !\n\n**Proposez 1 lettre** ')

                                    //PENDU

                                    switch (essaies) {
                                        case 9:
                                            embed.setImage('https://i.ibb.co/hBKvHNP/pendu9.png')
                                            break;
                                        case 8:
                                            embed.setImage('https://i.ibb.co/xzmLsxY/pendu8.png')
                                            break;
                                        case 7:
                                            embed.setImage('https://i.ibb.co/qRsR5Bz/pendu7.png')
                                            break;
                                        case 6:
                                            embed.setImage('https://i.ibb.co/jhvyB3h/pendu6.png')
                                            break;
                                        case 5:
                                            embed.setImage('https://i.ibb.co/z4Vx00f/pendu5.png')
                                            break;
                                        case 4:
                                            embed.setImage('https://i.ibb.co/3zQ02bh/pendu4.png')
                                            break;
                                        case 3:
                                            embed.setImage('https://i.ibb.co/2cvH59W/pendu3.png')
                                            break;
                                        case 2:
                                            embed.setImage('https://i.ibb.co/QCbJhWF/pendu2.png')
                                            break;
                                        case 1:
                                            embed.setImage('https://i.ibb.co/7rnN9Jh/pendu1.png')
                                            break;
                                        case 0:
                                            embed.setImage('https://i.ibb.co/mJ2dsP9/pendu0.png')
                                            break;
                                    }


                                    mespartie.edit(embed)
                                    mesprop.delete()

                                    if (essaies <= 0) {
                                        embed.setTitle('Pendu').setColor(0x800080).setDescription(':no_entry: **GAME OVER** !!\n\nLe mot était ```' + word + '```')
                                        var buttonrestart = new MessageButton().setID('restart').setLabel('Nouvelle Partie').setStyle('green'),
                                            buttonstop = new MessageButton().setID('stop').setLabel('Fin de Partie').setStyle('red'),
                                            row = new MessageActionRow().addComponents(buttonrestart, buttonstop);
                                        mespartie.edit(embed, row)
                                        essaies = 0
                                    }
                                }

                                if (affichage.indexOf('*') == -1) {
                                    embed = new MessageEmbed().setTitle('Pendu').setColor(0xFFD700).setDescription(':crown: **You WIN** !!\n\nBravo le mot était bien ```' + word + '```').setTimestamp().setFooter('Partie de ' + message.author.tag)
                                    var buttonrestart = new MessageButton().setID('restart').setLabel('Nouvelle Partie').setStyle('green'),
                                        buttonstop = new MessageButton().setID('stop').setLabel('Fin de Partie').setStyle('red'),
                                        row = new MessageActionRow().addComponents(buttonrestart, buttonstop);
                                    mespartie.edit(embed, row)
                                    essaies = 0

                                }
                            }
                        }
                    })
                }
            })
        }
    },


    restart: async button => {
        if (!button.clicker.user.bot) {
            var embed = new MessageEmbed()
                .setTitle('Nouvelle Partie')
                .setColor(0x964B00)
                .setDescription('Vous êtes sur le point de débuter une nouvelle partie\n\n:arrow_forward: __Sélectionnez un niveau de difficulter :__')
                .setTimestamp().setFooter('Partie de ' + button.clicker.user.tag)

            let option1 = new MessageMenuOption().setLabel('Facile').setEmoji('🟢').setValue('easy').setDescription('mot de 3 à 6 lettres'),
                option2 = new MessageMenuOption().setLabel('Moyenne').setEmoji('🟠').setValue('medium').setDescription('mot de 3 à 10 lettres'),
                option3 = new MessageMenuOption().setLabel('Difficile').setEmoji('🔴').setValue('hard').setDescription('mot de 3 à 15 lettres');

            let options = [option1, option2, option3]
            let select = new MessageMenu()
                .setID('commandmenu')
                .setPlaceholder('Selectionnez le niveau de difficulté')
                .setMaxValues(1)
                .setMinValues(1)
                .addOptions(options)

            var mespartie = await button.channel.send(embed, select)
            mespartie.channel.awaitMessages(m => m.author.bot == true, {
                max: 1,
                time: 1000000,
                errors: ['time']
            }).then(async messages => {
                var messagediff = messages.first(),
                    difficultie = messagediff.content.split(' ')[2]
                //Difficulté
                switch (difficultie) {
                    case "Facile":
                        var kwords = words.WORDS.EASY,
                            word = kwords[Math.floor(Math.random() * kwords.toString().split(',').length)], essaies = 10
                        break;
                    case "Moyen":
                        var kwords = words.WORDS.EASY + ',' + words.WORDS.MEDIUM,
                            word = kwords.toString().split(',')[Math.floor(Math.random() * kwords.toString().split(',').length)],
                            essaies = 9
                        break;
                    case "Difficile":
                        var kwords = words.WORDS.MEDIUM + ',' + words.WORDS.HARD,
                            word = kwords.toString().split(',')[Math.floor(Math.random() * kwords.toString().split(',').length)],
                            essaies = 8
                        break;
                }
                // Affichage
                var affichage = "", lettrestrouvees = ""
                for (let l = 0; l < word.length; l++) {
                    if (word[l] != " " && word[l] != "-") {
                        affichage += "* "
                    }
                    if (word[l] == " ") {
                        affichage += " "
                    }
                    if (word[l] == "-") {
                        affichage += "- "
                    }
                }
                embed.setTitle('Pendu').setColor(0x582900).setDescription('\n\n:chart_with_upwards_trend: Niveau de Difficulté :\n```' + difficultie + '``` \n :incoming_envelope: Essaies Restants : ```' + essaies + '```\n :lock: Mot à trouver : \n```' + affichage + '```\n\n**Proposez 1 lettre** ')

                await delay(1000).then(messagediff.delete())
                await mespartie.delete()
                mespartie = await button.channel.send(embed)
                const filteruser = m => m.author.id == button.clicker.user.id,
                    optionuser = {max: 1, time: 1000000, errors: ['time']}

                console.log(`[NEW GAME] ${button.clicker.user.tag} in ${button.message.guild.name} \\ ${difficultie} => ${word}`)

                //Proposition
                while (essaies > 0) {
                    await mespartie.channel.awaitMessages(filteruser, optionuser).then(async messagesprop => {
                        var mesprop = messagesprop.first()
                        if (mesprop.content == '#pendu') {
                            var meswarning = await mesprop.channel.send(':warning: **Demande de partie rejetée** \nVeuillez ne pas lancer 2 parties en même temps !')
                            await mesprop.delete()
                            await mespartie.delete()
                            essaies = 0
                        }
                        if (mesprop.content != '#pendu') {
                            if (!isNaN(mesprop.content) || mesprop.content.length > 1) {
                                var meswarning = await mesprop.channel.send(':warning: Veuillez entrer uniquement **1** lettre :warning:')
                                await mesprop.delete()
                            }
                            if (isNaN(mesprop.content) && mesprop.content.length == 1) {
                                try {
                                    meswarning.delete()
                                } catch (e) {
                                }                            //Lettre Trouvee
                                if (word.indexOf(mesprop.content) != -1) {
                                    lettrestrouvees += mesprop.content.toLowerCase()
                                    affichage = "";

                                    for (let x = 0; x < word.length; x++) {
                                        if (lettrestrouvees.indexOf(word[x]) != -1) {
                                            affichage += word[x] + " "
                                        } else {
                                            if (word[x] != " " && word[x] != "-") {
                                                affichage += "* "
                                            }
                                            if (word[x] == " ") {
                                                affichage += " "
                                            }
                                            if (word[x] == "-") {
                                                affichage += "- "
                                            }
                                        }
                                    }
                                    embed.setTitle('Pendu').setColor(0x00ff00).setDescription(':incoming_envelope: Essaies Restants : ```' + essaies + '```\n :lock: Mot à trouver : \n```' + affichage + '```\n\n:white_check_mark: Lettre "**' + mesprop.content + '**" trouvée !\n\n**Proposez 1 lettre** ')
                                    mespartie.edit(embed)
                                    mesprop.delete()


                                } else {
                                    essaies -= 1
                                    embed.setTitle('Pendu').setColor(0xff0000).setDescription(':incoming_envelope: Essaies Restants : ```' + essaies + '```\n :lock: Mot à trouver : \n```' + affichage + '```\n\n❌ Lettre "**' + mesprop.content + '**" inexistante !\n\n**Proposez 1 lettre** ')

                                    //PENDU

                                    switch (essaies) {
                                        case 9:
                                            embed.setImage('https://i.ibb.co/hBKvHNP/pendu9.png')
                                            break;
                                        case 8:
                                            embed.setImage('https://i.ibb.co/xzmLsxY/pendu8.png')
                                            break;
                                        case 7:
                                            embed.setImage('https://i.ibb.co/qRsR5Bz/pendu7.png')
                                            break;
                                        case 6:
                                            embed.setImage('https://i.ibb.co/jhvyB3h/pendu6.png')
                                            break;
                                        case 5:
                                            embed.setImage('https://i.ibb.co/z4Vx00f/pendu5.png')
                                            break;
                                        case 4:
                                            embed.setImage('https://i.ibb.co/3zQ02bh/pendu4.png')
                                            break;
                                        case 3:
                                            embed.setImage('https://i.ibb.co/2cvH59W/pendu3.png')
                                            break;
                                        case 2:
                                            embed.setImage('https://i.ibb.co/QCbJhWF/pendu2.png')
                                            break;
                                        case 1:
                                            embed.setImage('https://i.ibb.co/7rnN9Jh/pendu1.png')
                                            break;
                                        case 0:
                                            embed.setImage('https://i.ibb.co/mJ2dsP9/pendu0.png')
                                            break;
                                    }


                                    mespartie.edit(embed)
                                    mesprop.delete()

                                    if (essaies <= 0) {
                                        embed.setTitle('Pendu').setColor(0x800080).setDescription(':no_entry: **GAME OVER** !!\n\nLe mot était ```' + word + '```')
                                        var buttonrestart = new MessageButton().setID('restart').setLabel('Nouvelle Partie').setStyle('green'),
                                            buttonstop = new MessageButton().setID('stop').setLabel('Fin de Partie').setStyle('red'),
                                            row = new MessageActionRow().addComponents(buttonrestart, buttonstop);
                                        mespartie.edit(embed, row)
                                        essaies = 0
                                    }
                                }

                                if (affichage.indexOf('*') == -1) {
                                    embed = new MessageEmbed().setTitle('Pendu').setColor(0xFFD700).setDescription(':crown: **You WIN** !!\n\nBravo le mot était bien ```' + word + '```').setTimestamp().setFooter('Partie de ' + button.clicker.user.tag)
                                    var buttonrestart = new MessageButton().setID('restart').setLabel('Nouvelle Partie').setStyle('green'),
                                        buttonstop = new MessageButton().setID('stop').setLabel('Fin de Partie').setStyle('red'),
                                        row = new MessageActionRow().addComponents(buttonrestart, buttonstop);
                                    mespartie.edit(embed, row)
                                    essaies = 0
                                }
                            }
                        }
                    })
                }

            })
        }
    },
    name: 'new'

}