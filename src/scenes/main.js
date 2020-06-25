const User = require('../models/User');
const {Extra} = require('telegraf')
const Scene = require('telegraf/scenes/base')

const main = new Scene('main')

main.enter(async (ctx) =>{

    const candidate = await User.findOne({
        telegramId: ctx.update.message.from.id
    })

    if (!candidate) {
        const newUser = new User({
            telegramId: ctx.update.message.from.id
        });
        await newUser.save()
    }

    await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id)

    await ctx.reply('User info and statistics',
        Extra.HTML().markup((m) => m.inlineKeyboard([

            [
                m.callbackButton('All channels', 'All channels')
            ],
            [
                m.callbackButton('User posts', 'userPosts'),
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


main.action("userPosts", async (ctx) => {
    await ctx.scene.enter("userPosts")
})


module.exports = main