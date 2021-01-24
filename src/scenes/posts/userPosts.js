const { Extra } = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const Post = require("../../models/Post");

const userPosts = new Scene("userPosts");

userPosts.enter(async (ctx) => {
  try {
    let keyboard = await getPosts(ctx.update.callback_query.message.chat.id);
    await ctx.answerCbQuery();

    if (!keyboard) {
      keyboard = {
        text:
          "Пока у вас 0 постов. Все ваши посты будут отображатся в этом меню",
        markup: Extra.markdown().markup((m) =>
          m.inlineKeyboard([
            [
              Markup.callbackButton("Add post", "addPost"),
              Markup.callbackButton("Back", "back"),
            ],
          ])
        ),
      };
    }

    if (
      ctx.update.callback_query &&
      (ctx.update.callback_query.data === "confirm" ||
        ctx.update.callback_query.data === "back" ||
        ctx.update.callback_query.data.indexOf("delete") !== -1)
    ) {
      await ctx.reply(keyboard.text, keyboard.markup);
    } else {
      await ctx.editMessageText(keyboard.text, keyboard.markup);
    }
  } catch (e) {
    console.log(e.message);
  }
});

userPosts.start(async (ctx) => {
  try {
    await ctx.scene.enter("main");
  } catch (e) {
    console.log(e.message);
  }
});

userPosts.on("message", async (ctx) => {
  try {
    await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
  } catch (e) {
    console.log(e.message);
  }
});

userPosts.action("back", async (ctx) => {
  try {
    await ctx.scene.enter("main", ctx.state);
  } catch (e) {
    console.log(e.message);
  }
});

userPosts.action("addPost", async (ctx) => {
  try {
    await ctx.scene.enter("addName");
  } catch (e) {
    console.log(e.message);
  }
});

userPosts.on("callback_query", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "getPost") {
      await ctx.scene.enter("viewPost");
    } else if (data.action === "next") {
      const keyboard = await getPosts(
        ctx.update.callback_query.message.chat.id,
        data.skip + data.limit
      );

      if (keyboard) {
        await ctx.editMessageText(keyboard.text, keyboard.markup);
      }
    } else if (data.action === "previous" && data.skip > 0) {
      const keyboard = await getPosts(
        ctx.update.callback_query.message.chat.id,
        data.skip - data.limit
      );

      await ctx.editMessageText(keyboard.text, keyboard.markup);
    }
  } catch (e) {
    console.log(e.message);
  }
});

const getPosts = async (userId, skip = 0, limit = 5) => {
  try {
    let posts = await Post.find({
      userId: userId,
      completed: true,
    })
      .skip(skip)
      .limit(limit);

    if (posts.length === 0) {
      return null;
    }

    posts = posts.map((x) => [
      Markup.callbackButton(
        x.name,
        JSON.stringify({
          action: "getPost",
          id: x.telegramId,
          userId: x.userId,
        })
      ),
    ]);

    const keyboard = [
      [
        Markup.callbackButton("Add post", "addPost"),
        Markup.callbackButton("Back", "back"),
      ],
      ...posts,
      [
        Markup.callbackButton(
          "Previous",
          JSON.stringify({
            action: "previous",
            limit: limit,
            skip: skip,
          })
        ),
        Markup.callbackButton(
          "Next",
          JSON.stringify({
            action: "next",
            limit: limit,
            skip: skip,
          })
        ),
      ],
    ];

    return {
      text: "Все ваши посты, которые вы создали",
      markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
    };
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = userPosts;
