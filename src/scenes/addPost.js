const {Extra} = require('telegraf')
const WizardScene = require("telegraf/scenes/wizard");


const addPost = new WizardScene(
    'addPost',
    async (ctx) => {
        await ctx.answerCbQuery()
        await ctx.editMessageText('Перешлите мне пост или создайте его',
            Extra.HTML().markup((m) => m.inlineKeyboard([
                [
                    m.callbackButton('create', 'create')
                ]
            ])))
    },
    async (ctx) => {
        await ctx.reply('All your posts')
        return ctx.wizard.next();
    },
)
addPost.action('create', async (ctx) => {
    return ctx.wizard.next();
})
addPost.on('message', async (ctx) => {
    await ctx.telegram.sendCopy(ctx.chat.id, ctx.message)
})


module.exports = addPost