const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const Post = require("../models/Post");
require("dotenv").config();

const addPost = new WizardScene("addPost", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
      "Перешлите мне пост или создайте его",
      Extra.HTML().markup((m) =>
          m.inlineKeyboard([[m.callbackButton("back", "back")]])
      )
  );
});

addPost.action("back", async (ctx) => {
  await ctx.scene.enter("userPosts");
});

addPost.on("message", async (ctx) => {
  try {
    let keyboard = [
      [Markup.callbackButton("Add button", "addButton")],
      [Markup.callbackButton("Confirm", "confirm")],
    ];

    if (ctx.update.message.reply_markup) {
      if (ctx.update.message.reply_markup.inline_keyboard) {
        keyboard = ctx.update.message.reply_markup.inline_keyboard.concat(
            keyboard
        );
      }
    }
    if (!ctx.update.message.poll) {
      try {
        await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
        await ctx.tg.deleteMessage(
            ctx.chat.id,
            ctx.update.message.message_id - 1
        );
        await ctx.telegram.sendCopy(
            ctx.chat.id,
            ctx.message,
            Extra.HTML().markup((m) => m.inlineKeyboard(keyboard))
        );
      } catch (e) {
        await ctx.reply(
            "Перешлите мне пост или создайте его",
            Extra.HTML().markup((m) =>
                m.inlineKeyboard([[m.callbackButton("back", "back")]])
            )
        );
      }
    } else {
      const pollResp = await ctx.tg.forwardMessage(
          process.env.STORAGE,
          ctx.update.message.chat.id,
          ctx.update.message.message_id
      );
      await ctx.tg.deleteMessage(
          ctx.update.message.chat.id,
          ctx.update.message.message_id
      );
      await ctx.tg.deleteMessage(
          ctx.update.message.chat.id,
          ctx.update.message.message_id - 1
      );

      const newPoll = new Post({
        telegramId: pollResp.message_id,
        userId: ctx.update.message.chat.id,
      });
      await newPoll.save();
      await ctx.scene.enter("userPosts");
    }
  } catch (e) {
    console.log(e.message);
  }
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
    const newPost = new Post({
      telegramId: resp.message_id,
      userId: ctx.update.callback_query.message.chat.id,
    });
    await newPost.save();
    await ctx.answerCbQuery();
    await ctx.tg.deleteMessage(
        ctx.update.callback_query.message.chat.id,
        ctx.update.callback_query.message.message_id
    );
    await ctx.scene.enter("userPosts");
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = addPost;
