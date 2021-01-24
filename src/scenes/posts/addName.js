const { Extra } = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Post = require("../../models/Post");

const addName = new Scene("addName");

addName.enter(async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      "Пришлите название вашего поста",
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([[m.callbackButton("back", "back")]])
      )
    );
  } catch (e) {
    console.log(e.message);
  }
});

addName.action("back", async (ctx) => {
  await ctx.scene.enter("userPosts").catch((e) => console.log(e.message));
});

addName.on("message", async (ctx) => {
  try {
    let post = await Post.findOne({
      userId: ctx.update.message.chat.id,
    })
      .sort({ _id: -1 })
      .limit(1);

    if (!post || post.completed) {
      const newPost = new Post({
        userId: ctx.update.message.chat.id,
        name: ctx.update.message.text,
        date: new Date(),
      });

      await newPost.save();
    } else {
      post.name = ctx.update.message.text;
      await post.save();
    }

    try {
      await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
    } catch (e) {
      console.log(
        `error deleteMessage, message id: ${ctx.update.message.message_id}, chat id: ${ctx.chat.id}`
      );
    }
    await ctx.scene.enter("addPost");
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = addName;
