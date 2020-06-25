const {Extra} = require('telegraf')
const Scene = require('telegraf/scenes/base')

const userPosts = new Scene('userPosts')

userPosts.enter(async (ctx) =>{

    let entity =  {
        type: 'post',
        id: '44324242423'
    }

    let json = JSON.stringify(entity);

    await ctx.answerCbQuery()

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
})


userPosts.on('message', (ctx) => ctx.reply('U can use menu for navigation'))//delete

userPosts.action('addPost', (ctx) => ctx.scene.enter("addPost"))

userPosts.on('callback_query', (ctx) => {
        console.log(JSON.parse(ctx.update.callback_query.data))
})


module.exports = userPosts