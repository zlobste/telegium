const {Extra, Markup} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const changeMembersCountInterval = new Scene("changeMembersCountInterval");
const Filter = require("../../../models/Filter");

changeMembersCountInterval.enter(async (ctx) => {
    try {


        let filter;
        const keyboard = [
            [
                Markup.callbackButton(
                    "Back",
                    "back"
                ),
                Markup.callbackButton(
                    "To catalog",
                    "catalog"
                ),
            ],
        ];

        if (ctx.update.callback_query) {
            filter = await Filter.findOne({userId: ctx.update.callback_query.message.chat.id});

            if (filter) {

                await ctx.answerCbQuery();
                await ctx.editMessageText(`Количество подписчиков: ${filter.interval.members.start} - ${filter.interval.members.finish}\n\nЧтобы изменить интервал пришлите новый в формате 500-1000`,
                    Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)));
            }

        } else {
            filter = await Filter.findOne({userId: ctx.update.message.chat.id});

            if (filter) {

                await ctx.reply(`Количество подписчиков: ${filter.interval.members.start} - ${filter.interval.members.finish}\n\nЧтобы изменить интервал пришлите новый в формате 500-1000`,
                    Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)));
            }
        }


    } catch (e) {
        console.log(e.message);
    }
});

changeMembersCountInterval.on("message", async (ctx) => {
    try {
        let cost = ctx.update.message.text;


        if (cost) {
            cost = cost.split("-");
            if (cost.length !== 2) {
                return await ctx.reply("Неправильный формат вода!");
            }

            let start = Math.round(Number(cost[0]));
            let finish = Math.round(Number(cost[1]));


            if (start && finish) {

                if (start > finish) {
                    let temp = start;
                    start = finish;
                    finish = temp;
                }

                let filter = await Filter.findOne({userId: ctx.update.message.chat.id});

                if (filter) {
                    filter.interval.members.start = start;
                    filter.interval.members.finish = finish;
                    await filter.save();
                }

                await ctx.scene.enter("changeMembersCountInterval");

            } else {
                return await ctx.reply("Неправильный формат вода!");
            }
        }

    } catch (e) {
        console.log(e.message);
    }
});

changeMembersCountInterval.on("callback_query", async (ctx) => {
    try {
        const action = ctx.update.callback_query.data;

        if (action === "back") {
            await ctx.scene.enter("changeCatalogInterval");
        } else if (action === "catalog") {
            await ctx.scene.enter("catalog");
        }
    } catch (e) {
        console.log(e.message);
    }
});

module.exports = changeMembersCountInterval;