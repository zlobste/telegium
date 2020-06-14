const { Telegraf, Markup, Extra } = require('telegraf')
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User');



async function start() {

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


            return ctx.reply('User info and statistics',
                Extra.HTML().markup((m) => m.inlineKeyboard([

                    [
                        m.callbackButton('All channels', 'All channels')
                    ],
                    [
                        m.callbackButton('User posts', 'User posts'),
                        m.callbackButton('User channels', 'User channels')
                    ],
                    [
                        m.callbackButton('Notifications', 'Notifications'),
                        m.callbackButton('Basket', 'Basket'),
                    ],
                    [
                        m.callbackButton('Put money', 'Put money'),
                        m.callbackButton('Get money', 'Get money'),
                    ]
                ])))


        })

        bot.action('All channels', async (ctx, next) => {
            await ctx.answerCbQuery()
            return ctx.reply('👍').then(() => next())
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