const {Extra} = require('telegraf')
const Scene = require('telegraf/scenes/base')

const userPosts = new Scene('userPosts')

userPosts.enter(async (ctx) =>{

    let entity = {
        type: 'post',
        id: '44324242423'
    }

    let json = JSON.stringify(entity);


    if (ctx.update.callback_query !== undefined && ctx.update.callback_query.data === 'confirm' ||
        ctx.update.message !== undefined && ctx.update.message.poll !== undefined) {

        await ctx.reply('All your posts',
            Extra.HTML().markup((m) => m.inlineKeyboard([

                [
                    m.callbackButton('Add post', 'addPost'),
                    m.callbackButton('Back', 'back')
                ],
                [
                    m.callbackButton('post1', json),
                ],
                [
                    m.callbackButton('post2', 'post2'),
                ],
                [
                    m.callbackButton('Next', 'next'),
                    m.callbackButton('Previous', 'previous'),
                ]
            ]))
        )

    } else {
        await ctx.editMessageText('All your posts',
            Extra.HTML().markup((m) => m.inlineKeyboard([

                [
                    m.callbackButton('Add post', 'addPost'),
                    m.callbackButton('Back', 'back')
                ],
                [
                    m.callbackButton('post1', json),
                ],
                [
                    m.callbackButton('post2', 'post2'),
                ],
                [
                    m.callbackButton('Next', 'next'),
                    m.callbackButton('Previous', 'previous'),
                ]
            ]))
        )
    }


})


userPosts.on('message', async (ctx) => {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id)
})

userPosts.action('back', async (ctx) => {
    await ctx.scene.enter('main', ctx.state)
})

userPosts.action('addPost', async (ctx) => {
    await ctx.scene.enter('addPost')
})


userPosts.on('callback_query', async (ctx) => {
    console.log(JSON.parse(ctx.update.callback_query.data))
})


module.exports = userPosts