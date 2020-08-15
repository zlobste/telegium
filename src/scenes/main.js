const User = require("../models/User");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const main = new Scene("main");

main.enter(async (ctx) => {
  try {
    if (ctx.update.callback_query) {
      await ctx.answerCbQuery();
      const menu = await getUserInfo(ctx, ctx.update.callback_query.from.id);
      await ctx.editMessageText(menu.text, menu.markup);
    } else if (ctx.update.message.text === "/start") {
      const candidate = await User.findOne({
        telegramId: ctx.update.message.from.id,
      });

      if (!candidate) {
        const newUser = new User({
          telegramId: ctx.update.message.from.id,
        });
        await newUser.save();
      }

      await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
      const menu = await getUserInfo(ctx, ctx.update.message.from.id);
      await ctx.reply(menu.text, menu.markup);
    }
  } catch (e) {
    console.log(e.message);
  }
});

main.start(async (ctx) => {
    await ctx.scene.enter("main");
});

main.on("message", async (ctx) => {
    try {
        await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
    } catch (e) {
        console.log(e.message);
    }
});

main.action("userChannels", async (ctx) => {
    try {
        await ctx.scene.enter("userChannels");
    } catch (e) {
        console.log(e.message);
    }
});

main.action("userPosts", async (ctx) => {
    try {
        await ctx.scene.enter("userPosts");
    } catch (e) {
        console.log(e.message);
    }
});

main.action("catalog", async (ctx) => {

    try {
        await ctx.scene.enter("catalog");
    } catch (e) {
        console.log(e.message);
    }

});

const getUserInfo = async (ctx, userId) => {
    try {
        let candidate = await User.findOne({
            telegramId: userId,
        });

        if (!candidate) {
            const newUser = new User({
                telegramId: userId,
            });
            await newUser.save();
            candidate = newUser;
        }

        return {
            text: `**User info**\nuserID: ${candidate.telegramId}\nbalance: ${candidate.balance}`,
            markup: Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    [m.callbackButton("All channels", "catalog")],
                    [
                        m.callbackButton("User posts", "userPosts"),
                        m.callbackButton("User channels", "userChannels"),
                    ],
                    [
                        m.callbackButton("Notifications", "Notifications"),
                        m.callbackButton("Basket", "Basket"),
                    ],
                    [
                        m.callbackButton("Put money", "Put money"),
                        m.callbackButton("Get money", "Get money"),
                    ],
                ])
            ),
        };
    } catch (e) {
        console.log(e.message);
    }
};

module.exports = main;
