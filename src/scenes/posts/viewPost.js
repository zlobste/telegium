const Markup = require("telegraf/markup");
const { Extra } = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Post = require("../../models/Post");

const viewPost = new Scene("viewPost");

viewPost.enter(async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "getPost" || data.action === "getPostForPosting") {
      const post = await Post.findOne({
        telegramId: data.id,
        userId: ctx.update.callback_query.message.chat.id,
      });

      if (post) {
        await ctx.tg.deleteMessage(
          ctx.update.callback_query.message.chat.id,
          ctx.update.callback_query.message.message_id
        );

        const resp = await ctx.tg.forwardMessage(
          `-100${process.env.STORAGE}`,
          `-100${process.env.STORAGE}`,
          post.telegramId
        );

        delete resp.forward_from;

        let keyboard = [];

        if (data.action === "getPost") {
          keyboard = [
            [
              Markup.callbackButton(
                "Back",
                JSON.stringify({
                  action: "back",
                })
              ),
              Markup.callbackButton(
                "Delete",
                JSON.stringify({
                  action: "delete",
                  id: data.id,
                })
              ),
            ],
          ];
        } else {
          keyboard = [
            [
              Markup.callbackButton(
                "Back",
                JSON.stringify({
                  action: "backToPostList",
                })
              ),
              Markup.callbackButton(
                "Confirm",
                JSON.stringify({
                  action: "confirmOrder",
                  id: data.id,
                })
              ),
            ],
          ];
        }

        if (resp.reply_markup) {
          if (resp.reply_markup.inline_keyboard) {
            keyboard = resp.reply_markup.inline_keyboard.concat(keyboard);
          }
        }

        await ctx.telegram.sendCopy(
          ctx.update.callback_query.message.chat.id,
          resp,
          Extra.markdown().markup((m) => m.inlineKeyboard(keyboard))
        );

        await ctx.tg.deleteMessage(
          `-100${process.env.STORAGE}`,
          resp.message_id
        );
      }
    }
  } catch (e) {
    console.log(e.message);
  }
});

viewPost.on("callback_query", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "delete") {
      try {
        await Post.deleteOne({
          telegramId: data.id,
          userId: ctx.update.callback_query.message.chat.id,
        }).catch((e) => console.log(e.message));

        await ctx.tg
          .deleteMessage(
            ctx.update.callback_query.message.chat.id,
            ctx.update.callback_query.message.message_id
          )
          .catch((e) => console.log(e.message));

        await ctx.tg
          .deleteMessage(`-100${process.env.STORAGE}`, data.id)
          .catch((e) => console.log(e.message));
      } catch (e) {
        console.log(e.message);
      }

      await ctx.scene.enter("userPosts");
    } else if (data.action === "back") {
      try {
        await ctx.answerCbQuery();
        await ctx.tg.deleteMessage(
          ctx.update.callback_query.message.chat.id,
          ctx.update.callback_query.message.message_id
        );
      } catch (e) {
        console.log(e.message);
      }
      await ctx.scene.enter("userPosts");
    } else if (data.action === "backToPostList") {
      try {
        await ctx.tg.deleteMessage(
          ctx.update.callback_query.message.chat.id,
          ctx.update.callback_query.message.message_id
        );
      } catch (e) {
        console.log(e.message);
      }
      await ctx.scene.enter("choosePostForOrder");
    } else if (data.action === "confirmOrder") {
      await ctx.scene.enter("makeOrder");
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = viewPost;
