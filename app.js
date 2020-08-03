require("dotenv").config();
const mongoose = require("mongoose");
const session = require("telegraf/session");
const {Telegraf} = require("telegraf");
const Stage = require("telegraf/stage");
const main = require("./src/scenes/main");
const userPosts = require("./src/scenes/posts/userPosts");
const editPost = require("./src/scenes/posts/editPost");
const addName = require("./src/scenes/posts/addName");
const addPost = require("./src/scenes/posts/addPost");
const viewPost = require("./src/scenes/posts/viewPost");
const userChannels = require("./src/scenes/channels/userChannels")
const addChannel = require("./src/scenes/channels/addChannel")
const viewChannel = require("./src/scenes/channels/viewChannel")
const channelSettings = require("./src/scenes/channels/settings/channelSettings")
const changePrice = require("./src/scenes/channels/settings/changePrice")
const changeAutoposting = require("./src/scenes/channels/settings/changeAutoposting")
const changePostTime = require("./src/scenes/channels/settings/changePostTime")
const mtproto = require("./mtproto");

async function start() {
    try {
        mongoose.connect(process.env.DB_LINK, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
        });

        const bot = new Telegraf(process.env.BOT_TOKEN);

        const stage = new Stage();

        stage.register(main);
        stage.register(userPosts);
        stage.register(editPost);
        stage.register(addName);
        stage.register(addPost);
        stage.register(viewPost);
        stage.register(userChannels);
        stage.register(addChannel);
        stage.register(viewChannel);
        stage.register(channelSettings);
        stage.register(changePrice);
        stage.register(changeAutoposting);
        stage.register(changePostTime);


        /*stage.register([
            main,
            userPosts,
            editPost,
            addName,
            addPost,
            viewPost,
            userChannels,
            addChannel,
            viewChannel,
            channelSettings,
            changePrice,
            changeAutoposting
        ])*/


        bot.use(session());
        bot.use(stage.middleware());

        bot.start(async (ctx) => {
            await ctx.scene.enter("main");
        });

        bot.catch((err, ctx) => {
            console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
    });

    bot.launch();
    //await mtproto.authenticate()
  } catch (e) {
    console.log("Error: ", e.message);
  }
}

start();
