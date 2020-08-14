const Scene = require("telegraf/scenes/base");
const changeCatalogCategory = new Scene("changeCatalogCategory");
const Category = require("../../../models/Category");
const Filter = require("../../../models/Filter");
const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");

changeCatalogCategory.enter(async (ctx) => {
    try {
        await ctx.answerCbQuery();

        const data = JSON.parse(ctx.update.callback_query.data);

        const categories = await getCategories(data.id);
        if (categories) {
            await ctx.editMessageText(categories.text, categories.markup);
        } else {
            await ctx.editMessageText("Мы ещё не дорбавили категории");
        }
    } catch (e) {
        console.log(e.message);
    }
});

changeCatalogCategory.on("callback_query", async (ctx) => {
    try {
        await ctx.answerCbQuery();
        const data = JSON.parse(ctx.update.callback_query.data);

        if (data.action === "back") {
            await ctx.scene
                .enter("catalog")
                .catch((e) => console.log(e.message));
        } else if (data.action === "next") {
            const keyboard = await getCategories(data.id, data.skip + data.limit);

            if (keyboard) {
                await ctx.editMessageText(keyboard.text, keyboard.markup);
            }
        } else if (data.action === "previous" && data.skip > 0) {
            const keyboard = await getCategories(data.id, data.skip - data.limit);

            await ctx.editMessageText(keyboard.text, keyboard.markup);
        } else {
            if (data.n) {
                const channel = await Channel.findOne({telegramId: data.id});
                channel.category = data.n;
                await channel.save();

                const keyboard = await getCategories(data.id, data.s);

                if (keyboard) {
                    await ctx.editMessageText(keyboard.text, keyboard.markup);
                }
            }
        }
    } catch (e) {
        console.log(e.message);
    }
});

const getCategories = async (id, skip = 0, limit = 5) => {
    try {

        const channel = await Filter.findOne({
            telegramId: id,
        });
        if (channel) {

            let filter = await Filter.findOne({
                userId: channel.userId,
            });

            if (!filter) {

                filter = new Filter({
                    userId: channel.userId,
                });

                filter.save();
            }


            let categories = await Category.find().skip(skip).limit(limit);

            if (categories.length === 0) {
                return null;
            }

            categories = categories.map((x) => [
                Markup.callbackButton(
                    x.name,
                    JSON.stringify({
                        n: x.name,
                        id: id,
                        l: limit,
                        s: skip,
                    })
                ),
            ]);

            const keyboard = [
                ...categories,
                [
                    Markup.callbackButton(
                        "Previous",
                        JSON.stringify({
                            action: "previous",
                            limit: limit,
                            skip: skip,
                            id: id,
                        })
                    ),
                    Markup.callbackButton(
                        "Next",
                        JSON.stringify({
                            action: "next",
                            limit: limit,
                            skip: skip,
                            id: id,
                        })
                    ),
                ],
                [
                    Markup.callbackButton(
                        "Back",
                        JSON.stringify({
                            action: "back",
                            id: id,
                        })
                    ),
                ],
            ];


            let category = 'Bсе';
            if (filter.categories.length > 0) {
                category = filter.categories.join(", ");
                category = category.substr(0, category.length - 2);
            }

            let sorting = "";
            if (filter.sort.byCostIncrease) {
                sorting = "По увеличению цены";
            } else if (filter.sort.byCostDecrease) {
                sorting = "По уменьшению цены";
            } else if (filter.sort.byMembersIncrease) {
                sorting = "По увеличению подписчиков";
            } else if (filter.sort.byMembersDecrease) {
                sorting = "По уменьшению подписчиков";
            } else {
                return null;
            }

            return {
                text: `Категории:\n${category}\n\nИнтервал:\nЦена поста: ${filter.interval.cost.start} - ${filter.interval.cost.finish} ₽\nПодписчики: ${filter.interval.members.start} - ${filter.interval.members.finish}\n\nСортировка: ${sorting}`,
                markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
            };


        } else {
            return null;
        }


    } catch (e) {
        console.log(e.message);
    }
};

module.exports = changeCatalogCategory;