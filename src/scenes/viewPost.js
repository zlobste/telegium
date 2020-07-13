const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Post = require("../models/Post");
const viewPost = new Scene("viewPost");

viewPost.enter(async (ctx) => {
  try {
    //console.log('data: ', ctx.update.callback_query.data)

    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "getPost") {
      const post = await Post.findOne({
        telegramId: data.id,
        userId: data.userId,
      });

      if (post) {
        const resp = await ctx.tg.forwardMessage(
            ctx.update.callback_query.message.chat.id,
            `-100${process.env.STORAGE}`,
            post.telegramId
        );

        await ctx.tg.deleteMessage(
            ctx.update.callback_query.message.chat.id,
            ctx.update.callback_query.message.message_id
        );
      }
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = viewPost;
