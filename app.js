require('dotenv').config()
const mongoose = require('mongoose')
const session = require('telegraf/session');
const {Telegraf} = require('telegraf')
const Stage = require('telegraf/stage');
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


        const bot = new Telegraf(process.env.BOT_TOKEN)

        const stage = new Stage()

        stage.register(main)
        stage.register(userPosts)
        stage.register(addPost)

        bot.use(session())
        bot.use(stage.middleware())


        bot.start(async (ctx) => {
            await ctx.scene.enter('main')
        })

        bot.catch((err, ctx) => {
            console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
        })

        bot.launch()

    }catch (e) {
        console.log('Error: ', e.message)
    }
}

start()