const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const addName = new Scene("addName");
const Post = require("../models/Post");

addName.enter(async (ctx) => {
  try {
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
        .sort({_id: -1})
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

    await ctx.tg
        .deleteMessage(ctx.chat.id, ctx.update.message.message_id)
        .catch((e) => {
          console.log(e.message);
          console.log(
              `error deleteMessage, message id: ${ctx.update.message.message_id}, chat id: ${ctx.chat.id}`
          );
        });

    /*await ctx.tg.deleteMessage(
            ctx.chat.id,
            ctx.update.message.message_id -1
        )
            .then( () =>  console.log(`deleteMessage message id: ${ctx.update.message.message_id - 1}, chat id: ${ctx.chat.id}`))
            .catch( e => {
                console.log(e.message)
            console.log(`error deleteMessage - 1, message id: ${ctx.update.message.message_id -1}, chat id: ${ctx.chat.id}`)
        })
*/

    await ctx.scene.enter("_addPost");
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = addName;
