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
const userChannels = require("./src/scenes/channels/userChannels");
const addChannel = require("./src/scenes/channels/addition/addChannel");
const viewChannel = require("./src/scenes/channels/viewChannel");
const channelSettings = require("./src/scenes/channels/settings/channelSettings");
const changePrice = require("./src/scenes/channels/settings/changePrice");
const changeAutoposting = require("./src/scenes/channels/settings/changeAutoposting");
const changePostTime = require("./src/scenes/channels/settings/changePostTime");
const changeCategory = require("./src/scenes/channels/settings/changeCategory");
const setCategory = require("./src/scenes/channels/addition/setCategory");
const setPrice = require("./src/scenes/channels/addition/setPrice");
const setPostTime = require("./src/scenes/channels/addition/setPostTime");
const catalog = require('./src/scenes/catalog/catalog');
const changeCatalogCategory = require('./src/scenes/catalog/settings/changeCatalogCategory');
const changeCatalogSort = require('./src/scenes/catalog/settings/changeCatalogSort');
const changeCatalogInterval = require('./src/scenes/catalog/settings/changeCatalogInterval');
const changeMembersCountInterval = require('./src/scenes/catalog/settings/changeMembersCountInterval');
const changePostCostInterval = require('./src/scenes/catalog/settings/changePostCostInterval');
const makeOrder = require('./src/scenes/catalog/makeOrder');
const choosePostForOrder = require("./src/scenes/catalog/choosePostForOrder")

//const mtproto = require("./mtproto");

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
        stage.register(changeCategory);
        stage.register(setCategory);
        stage.register(setPrice);
        stage.register(setPostTime);
        stage.register(catalog);
        stage.register(changeCatalogCategory);
        stage.register(changeCatalogSort);
        stage.register(changeCatalogInterval);
        stage.register(changeMembersCountInterval);
        stage.register(changePostCostInterval);
        stage.register(makeOrder);
        stage.register(choosePostForOrder);


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
