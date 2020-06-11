const { Telegraf } = require('telegraf')
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User');



function start() {

    try {
        mongoose.connect(process.env.DB_LINK, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })

        const bot = new Telegraf(process.env.BOT_TOKEN)

        bot.start(async (ctx) => {

            const candidate = await User.findOne({
                telegramId: ctx.update.message.from.id
            })

            if (!candidate) {
                const newUser = new User({
                    telegramId: ctx.update.message.from.id
                });
                await newUser.save()
            }

            ctx.reply('Welcome')
        })

        bot.help((ctx) => ctx.reply('Send me a sticker'))
        bot.on('sticker', (ctx) => ctx.reply('👍'))
        bot.hears('hi', (ctx) => ctx.reply('Hey there'))
        bot.hears('m', (ctx) => ctx.reply('mmm'))
        bot.launch()

    }catch (e) {
        console.log('Error: ', e.message)
    }

}

start()