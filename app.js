require('dotenv').config()
const mongoose = require('mongoose')
const session = require("telegraf/session");
const {Telegraf} = require('telegraf')
const Stage = require("telegraf/stage");
const main = require('./src/scenes/main')
const userPosts = require('./src/scenes/userPosts')
const addPost = require('./src/scenes/addPost')



async function start() {

    try {
        mongoose.connect(process.env.DB_LINK, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })


        /*const userPosts = new WizardScene(
            "userPosts", // Имя сцены
            (ctx) => {
                const object = `{ id: '444432244343' }`
                console.log(object)
                ctx.reply('All your posts',
                    Extra.HTML().markup((m) => m.inlineKeyboard([

                        [
                            m.callbackButton('Add post', 'Add post'),
                            m.callbackButton('Back', 'Back')
                        ],
                        [
                            m.callbackButton('post1', object),
                        ],
                        [
                            m.callbackButton('post2', 'post2'),

                        ],
                        [
                            m.callbackButton('Next', 'Next'),
                            m.callbackButton('Previous', 'Previous'),
                        ]
                    ])))

                return ctx.wizard.next(); // Переходим к следующему обработчику.
            },
        )

       userPosts.on('callback_query', (ctx) => {
           console.log(ctx)
           //return ctx.wizard.next()
        })*/



        const stage = new Stage()


        const bot = new Telegraf(process.env.BOT_TOKEN)
        bot.use(session())
        bot.use(stage.middleware())

        stage.register(main)
        stage.register(userPosts)
        stage.register(addPost)


        bot.catch((err, ctx) => {
            console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
        })

        bot.start(async (ctx) => {
            await ctx.scene.enter("main")
        })

        bot.launch()

    }catch (e) {
        console.log('Error: ', e.message)
    }
}

start()