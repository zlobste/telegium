const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const editPost = new Scene("editPost");

editPost.enter(async (ctx) => {
  try {
    let keyboard = [
      [Markup.callbackButton("➕ button", "addButton")],
      [Markup.callbackButton("Add name", "addName")],
      [Markup.callbackButton("Confirm", "confirm")],
    ];

    if (ctx.update.callback_query.message.reply_markup) {
      if (ctx.update.callback_query.message.reply_markup.inline_keyboard) {
          let timeKeayboard =
              ctx.update.callback_query.message.reply_markup.inline_keyboard;
          timeKeayboard.pop();
          timeKeayboard.pop();
          keyboard = timeKeayboard.concat(keyboard);
      }
    }
    await ctx.telegram.sendCopy(
        ctx.update.callback_query.message.chat.id,
        ctx.update.callback_query.message,
        Extra.HTML().markup((m) => m.inlineKeyboard(keyboard))
    );
  } catch (e) {
    console.log(e.message);
  }
});

editPost.action("addButton", async (ctx) => {
});

editPost.on("message", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("Пришлите пост");
});

module.exports = editPost;
