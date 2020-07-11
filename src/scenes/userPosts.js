const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Post = require("../models/Post");
const userPosts = new Scene("userPosts");
const {getChannelMessages} = require("../../mtproto");

userPosts.enter(async (ctx) => {
    if (
        (ctx.update.callback_query !== undefined &&
            ctx.update.callback_query.data === "confirm") ||
        (ctx.update.message !== undefined && ctx.update.message.poll !== undefined)
    ) {
        await ctx.reply(
            "All your posts",
            Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    [
                        m.callbackButton("Add post", "addPost"),
                        m.callbackButton("Back", "back"),
                    ],
                    [m.callbackButton("post1", "post1")],
                    [m.callbackButton("post2", "post2")],
                    [
                        m.callbackButton("Next", "next"),
                        m.callbackButton("Previous", "previous"),
                    ],
                ])
            )
        );
    } else {
        await ctx.editMessageText(
            "All your posts",
            Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    [
                        m.callbackButton("Add post", "addPost"),
                        m.callbackButton("Back", "back"),
                    ],
                    [m.callbackButton("post1", "post1")],
                    [m.callbackButton("post2", "post2")],
                    [
                        m.callbackButton("Next", "next"),
                        m.callbackButton("Previous", "previous"),
                    ],
                ])
            )
        );
    }
});

const getPosts = async (id) => {
    try {
        /*let entity = {
                type: 'post',
                id: '44324242423'
            };

            let json = JSON.stringify(entity)*/

        const clientPosts = Post.find({userId: id}).map((x) => x.telegramId);

        await getChannelMessages(process.env.STORAGE, clientPosts).then((result) =>
            result.forEach((x) => console.log(x))
        );

        return {
            text: "",
            markup: Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    [
                        m.callbackButton("Add post", "addPost"),
                        m.callbackButton("Back", "back"),
                    ],
                    ...clientPosts,
                    [
                        m.callbackButton("Next", "next"),
                        m.callbackButton("Previous", "previous"),
                    ],
                ])
            ),
        };
    } catch (e) {
        console.log(e.message);
    }
};

userPosts.on("message", async (ctx) => {
    await ctx.tg
        .deleteMessage(ctx.chat.id, ctx.update.message.message_id)
        .catch((e) => console.log(e.message));
});

userPosts.action("back", async (ctx) => {
    await ctx.scene.enter("main", ctx.state).catch((e) => console.log(e.message));
});

userPosts.action("addPost", async (ctx) => {
    await ctx.scene.enter("addPost").catch((e) => console.log(e.message));
});

userPosts.on("callback_query", async (ctx) => {
    //show post logic
    // console.log(JSON.parse(ctx.update.callback_query.data))
});

module.exports = userPosts;
