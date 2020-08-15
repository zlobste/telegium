const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const channelSettings = new Scene("channelSettings");
const Channel = require("../../../models/Channel");

channelSettings.enter(async (ctx) => {
    try {
        await ctx.answerCbQuery();

        const data = JSON.parse(ctx.update.callback_query.data);
        const channel = await Channel.findOne({telegramId: data.id});

        if (channel) {
            await ctx.editMessageText(
                `Настройки канала:\nPost price: ${channel.price} ₽\nCategory: ${
                    channel.category
                }\nTime of active post: ${
                    channel.timeOfActivePost.split(":")[0]
                } часов ${channel.timeOfActivePost.split(":")[1]} минут\nAutoposting: ${
                    channel.autoposting
                }`,
                Extra.HTML().markup((m) =>
                    m.inlineKeyboard([
                        [
                            m.callbackButton(
                                "Category",
                                JSON.stringify({
                                    action: "changeCategory",
                                    id: data.id,
                                })
                            ),
                            m.callbackButton(
                                "Price",
                                JSON.stringify({
                                    action: "changePrice",
                                    id: data.id,
                                })
                            ),
                        ],
                        [
                            m.callbackButton(
                                "Time of active post",
                                JSON.stringify({
                                    action: "changePostTime",
                                    id: data.id,
                                })
                            ),
                            m.callbackButton(
                                "Autoposting",
                                JSON.stringify({
                                    action: "changeAutoposting",
                                    id: data.id,
                                })
                            ),
                        ],
                        [
                            m.callbackButton(
                                "Back",
                                JSON.stringify({
                                    action: "back",
                                    id: data.id,
                                })
                            ),
                        ],
                    ])
                )
            );
        } else {
            return ctx.reply("Ошибка! Канал не найден!");
        }
    } catch (e) {
        console.log(e.message);
    }
});

channelSettings.on("callback_query", async (ctx) => {
    try {
        const data = JSON.parse(ctx.update.callback_query.data);

        if (data.action === "back") {
            await ctx.scene.enter("viewChannel");
        } else if (data.action === "changeAutoposting") {
            await ctx.scene.enter("changeAutoposting");
        } else if (data.action === "changePrice") {
            await ctx.scene.enter("changePrice");
        } else if (data.action === "changePostTime") {
            await ctx.scene.enter("changePostTime");
        } else if (data.action === "changeCategory") {
            await ctx.scene.enter("changeCategory");
        }
    } catch (e) {
        console.log(e.message);
    }
});

module.exports = channelSettings;
