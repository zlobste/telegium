const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const Channel = require("../../models/Channel");
const userChannels = new Scene("userChannels");

userChannels.enter(async (ctx) => {
    try {

        await ctx.answerCbQuery();
        let keyboard
        if (ctx.update.callback_query) {
            keyboard = await getChannels(ctx, ctx.update.callback_query.message.chat.id);
        } else {
            keyboard = await getChannels(ctx, ctx.update.message.chat.id);
        }


        if (!keyboard) {
            keyboard = {
                text: 'Пока у вас 0 каналов. Все ваши каналы будут отображатся в этом меню',
                markup: Extra.markdown().markup((m) => m.inlineKeyboard(
                    [[
                        Markup.callbackButton("Add channel", "addChannel"),
                        Markup.callbackButton("Back", "back"),
                    ]]
                ))
            }
        }


        if (
            ctx.update.callback_query &&
            (
                ctx.update.callback_query.data === 'userChannels' ||
                ctx.update.callback_query.data === 'back'
            )
        ) {

            await ctx.editMessageText(keyboard.text, keyboard.markup);

        } else {

            await ctx.reply(keyboard.text, keyboard.markup);

        }
    } catch (e) {
        console.log(e.message);
    }
});


userChannels.start(async (ctx) => {
    await ctx.scene.enter("main").catch((e) => console.log(e.message));
});

userChannels.on("message", async (ctx) => {
    await ctx.tg
        .deleteMessage(ctx.chat.id, ctx.update.message.message_id)
        .catch((e) => console.log(e.message));
});

userChannels.action("back", async (ctx) => {
    await ctx.scene.enter("main", ctx.state).catch((e) => console.log(e.message));
});

userChannels.action("addChannel", async (ctx) => {
    await ctx.scene.enter("addChannel").catch((e) => console.log(e.message));
});

userChannels.on("callback_query", async (ctx) => {
    try {
        await ctx.answerCbQuery();

        const data = JSON.parse(ctx.update.callback_query.data);

        if (data.action === "getChannel") {
            await ctx.scene.enter("viewChannel");
        } else if (data.action === "next") {
            const keyboard = await getChannels(
                ctx,
                ctx.update.callback_query.message.chat.id,
                data.skip + data.limit
            );

            if (keyboard) {
                await ctx.editMessageText(keyboard.text, keyboard.markup);
            }
        } else if (data.action === "previous" && data.skip > 0) {
            const keyboard = await getChannels(
                ctx,
                ctx.update.callback_query.message.chat.id,
                data.skip - data.limit
            );

            await ctx.editMessageText(keyboard.text, keyboard.markup);
        }
    } catch (e) {
        console.log(e.message);
    }
});

const getChannels = async (ctx, userId, skip = 0, limit = 5) => {
    try {
        let channels = await Channel.find({
            userId: userId,
            completed: true,
        })
            .skip(skip)
            .limit(limit);

        if (channels.length === 0) {
            return null;
        }


        for (let i = 0; i < channels.length; i++) {

            let chat = await ctx.tg.getChat(channels[i].telegramId)
            channels[i].channelName = chat.title
        }

        channels = channels.map((x) => {
            return [
                Markup.callbackButton(
                    x.channelName,
                    JSON.stringify({
                        action: "getChannel",
                        id: x.telegramId,
                    })
                ),
            ]
        });


        const keyboard = [
            [
                Markup.callbackButton("Add Channel", "addChannel"),
                Markup.callbackButton("Back", "back"),
            ],
            ...channels,
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
            text: "Все ваши каналы, которые вы добавили в систему",
            markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
        };
    } catch (e) {
        console.log(e.message);
    }
};


module.exports = userChannels;
