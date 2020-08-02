const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Channel = require("../../models/Channel");
const viewChannel = new Scene("viewChannel");

viewChannel.enter(async (ctx) => {
    try {
        await ctx.answerCbQuery();
        const data = JSON.parse(ctx.update.callback_query.data);

        if (data.action === "getChannel") {

            const channel = await Channel.findOne({
                telegramId: data.id,
                userId: ctx.update.callback_query.message.chat.id,
            });

            if (channel) {

                const info = await ctx.tg.getChat(data.id)
                const countOfMembers = await ctx.tg.getChatMembersCount(data.id)

                await ctx.editMessageText(
                    `ID: ${info.id}\nTitle: ${info.title}\nDescription: ${info.description || "-"}\nMembers count: ${countOfMembers}`,
                    Extra.markdown().markup((m) => m.inlineKeyboard(
                        [
                            [
                                Markup.urlButton("Go to Channel", info.invite_link),
                                Markup.callbackButton("Back", "back"),
                            ],
                            [
                                Markup.callbackButton("Channel settings", "channelSettings"),
                            ]
                        ]
                    ))
                )
            } else {
                await ctx.reply("Ошибка! Нет такого канала!")
            }
        }
    } catch (e) {
        console.log(e.message);
    }
});


viewChannel.action("back", async (ctx) => {

    await ctx.scene.enter("userChannels").catch((e) => console.log(e.message));

});

viewChannel.action("back", async (ctx) => {

    await ctx.scene.enter("channelSettings").catch((e) => console.log(e.message));

});


module.exports = viewChannel;