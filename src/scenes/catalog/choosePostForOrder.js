const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const Post = require("../../models/Post");
const Order = require("../../models/Order");
const choosePostForOrder = new Scene("choosePostForOrder");

choosePostForOrder.enter(async (ctx) => {
    try {

        await ctx.answerCbQuery();
        const data = JSON.parse(ctx.update.callback_query.data);
        if (data) {

            data.userId = ctx.update.callback_query.message.chat.id
            let keyboard = await getPosts(data);
            if (!keyboard) {
                keyboard = {
                    text:
                        "Пока у вас 0 постов. Все ваши посты будут отображатся в этом меню",
                    markup: Extra.markdown().markup((m) =>
                        m.inlineKeyboard([
                            [
                                Markup.callbackButton(
                                    "Add post",
                                    JSON.stringify({
                                        action: "addName",
                                    })
                                ),
                                Markup.callbackButton(
                                    "Back",
                                    JSON.stringify({
                                        action: "backToCatalogView",
                                    })
                                ),
                            ],
                        ])
                    ),
                };
            }

            if (ctx.update.callback_query && data.action === "backToPostList") {
                await ctx.reply(keyboard.text, keyboard.markup);
            } else {
                await ctx.editMessageText(keyboard.text, keyboard.markup);
            }
        }
    } catch (e) {
        console.log(e.message);
    }
});

choosePostForOrder.on("callback_query", async (ctx) => {
    try {
        await ctx.answerCbQuery();
        const data = JSON.parse(ctx.update.callback_query.data);
        data.userId = ctx.update.callback_query.message.chat.id;

        if (data.action === "getPostForPosting") {

            await ctx.scene.enter("viewPost");

        } else if (data.action === "next") {

            const keyboard = await getPosts(
                data,
                data.skip + data.limit
            );
            if (keyboard) {
                await ctx.editMessageText(keyboard.text, keyboard.markup);
            }
        } else if (data.action === "previous" && data.skip > 0) {

            const keyboard = await getPosts(
                data,
                data.skip - data.limit
            );

            await ctx.editMessageText(keyboard.text, keyboard.markup);
        } else if (data.action === "backToCatalogView") {

            await ctx.scene.enter("viewChannel");

        } else if (data.action === "addName") {
            await ctx.scene.enter("addName");
        }
    } catch (e) {
        console.log(e.message);
    }
});

const getPosts = async (data, skip = 0, limit = 5) => {
    try {
        let posts = await Post.find({
            userId: data.userId,
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
                    action: "getPostForPosting",
                    id: x.telegramId,
                })
            ),
        ]);

        const keyboard = [
            [
                Markup.callbackButton(
                    "Add post",
                    JSON.stringify({
                        action: "addName",
                    })
                ),
                Markup.callbackButton(
                    "Back",
                    JSON.stringify({
                        action: "backToCatalogView",
                    })
                ),
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
            text: "Выберите пост для рекламного размещения!",
            markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
        };
    } catch (e) {
        console.log(e.message);
    }
};


choosePostForOrder.on("message", async (ctx) => {
    try {
        await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
    } catch (e) {
        console.log(e.message);
    }
});


module.exports = choosePostForOrder;
