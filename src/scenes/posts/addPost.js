const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Post = require("../../models/Post");
const addPost = new Scene("addPost");

addPost.enter(async (ctx) => {
  try {
    await ctx.reply(
        `Название поста: ${ctx.update.message.text}.\nА теперь пришлите мне сам пост`,
        Extra.HTML().markup((m) =>
            m.inlineKeyboard([[m.callbackButton("back", "back")]])
        )
    );
  } catch (e) {
    console.log(e.message);
  }
});

addPost.action("back", async (ctx) => {
  await ctx.scene.enter("addName").catch((e) => console.log(e.message));
});

addPost.on("message", async (ctx) => {
  try {
      let post = await Post.findOne({
          userId: ctx.update.message.chat.id,
      })
          .sort({_id: -1})
          .limit(1);

    if (post && !post.completed) {
      let keyboard = [
        [Markup.callbackButton("Edit", "editPost")],
        [Markup.callbackButton("Confirm", "confirm")],
      ];

      if (ctx.update.message.reply_markup) {
        if (ctx.update.message.reply_markup.inline_keyboard) {
          keyboard = ctx.update.message.reply_markup.inline_keyboard.concat(
              keyboard
          );
        }
      }

        await ctx.telegram
            .sendCopy(
                ctx.update.message.chat.id,
                ctx.update.message,
                Extra.markup((m) => m.inlineKeyboard(keyboard))
            )
            .catch(async (e) => {
                await ctx.telegram.sendCopy(
                    ctx.update.message.chat.id,
                    ctx.update.message,
                    Extra.HTML().markup((m) => m.inlineKeyboard(keyboard))
                );
            })
            .catch(async (e) => {
                await ctx.telegram.sendCopy(
                    ctx.update.message.chat.id,
                    ctx.update.message,
                    Extra.markdown().markup((m) => m.inlineKeyboard(keyboard))
                );
            })
            .catch(async (e) => {
                console.log(e.message);
                await ctx.reply(
                    "Перешлите мне пост или создайте его",
                    Extra.HTML().markup((m) =>
                        m.inlineKeyboard([[m.callbackButton("back", "back")]])
                    )
                );
            });

        await ctx.tg
            .deleteMessage(ctx.chat.id, ctx.update.message.message_id)
            .catch((e) => console.log(e.message));
    } else {
        await ctx.tg
            .deleteMessage(ctx.chat.id, ctx.update.message.message_id)
            .catch((e) => {
                console.log(e.message);
                console.log(
                    `error deleteMessage, message id: ${ctx.update.message.message_id}, chat id: ${ctx.chat.id}`
                );
            });
        await ctx.scene.enter("addName").catch((e) => console.log(e.message));
    }
  } catch (e) {
    console.log(e.message);
  }
});

addPost.action("editPost", async (ctx) => {
  // await ctx.scene.enter("addName").catch( e => console.log(e.message))
});

addPost.action("confirm", async (ctx) => {
  try {
    let keyboard = [];
    if (ctx.update.callback_query.message.reply_markup) {
      if (ctx.update.callback_query.message.reply_markup.inline_keyboard) {
          keyboard =
              ctx.update.callback_query.message.reply_markup.inline_keyboard;
          keyboard.pop();
        keyboard.pop();
      }
    }
    if (keyboard.length > 0) {
      await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(keyboard));
    }
    const resp = await ctx.tg.forwardMessage(
        `-100${process.env.STORAGE}`,
        ctx.update.callback_query.message.chat.id,
        ctx.update.callback_query.message.message_id
    );

      let post = await Post.findOne({
          userId: ctx.update.callback_query.message.chat.id,
      })
          .sort({_id: -1})
          .limit(1);

    post.telegramId = resp.message_id;
    post.completed = true;
    await post.save();

    await ctx.tg.deleteMessage(
        ctx.update.callback_query.message.chat.id,
        ctx.update.callback_query.message.message_id
    );

    await ctx.answerCbQuery();
    await ctx.scene.enter("userPosts");
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = addPost;
