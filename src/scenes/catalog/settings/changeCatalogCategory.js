const Scene = require("telegraf/scenes/base");
const changeCatalogCategory = new Scene("changeCatalogCategory");
const Category = require("../../../models/Category");
const Filter = require("../../../models/Filter");
const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");

changeCatalogCategory.enter(async (ctx) => {
    try {
        await ctx.answerCbQuery();

        const categories = await getCategories(ctx.update.callback_query.message.chat.id);
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
        data.id = ctx.update.callback_query.message.chat.id;

        if (data.action === "back") {
            await ctx.scene.enter("catalog").catch((e) => console.log(e.message));
        } else if (data.action === "next") {
            const keyboard = await getCategories(data.id, data.skip + data.limit);

            if (keyboard) {
                await ctx.editMessageText(keyboard.text, keyboard.markup);
            }
        } else if (data.action === "previous" && data.skip > 0) {
            const keyboard = await getCategories(data.id, data.skip - data.limit);

            await ctx.editMessageText(keyboard.text, keyboard.markup);
        } else {

            //logic
            if (data.n) {

                const filter = await Filter.findOne({
                    userId: data.id,
                });

                if (filter.categories.indexOf(data.n) === -1) {
                    filter.categories.push(data.n);
                } else {
                    filter.categories = filter.categories.filter(x => x !== data.n);
                }
                await filter.save();

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

const getCategories = async (userId, skip = 0, limit = 5) => {
    try {

        let filter = await Filter.findOne({
            userId: userId,
        });

        if (!filter) {
            filter = new Filter({
                userId: userId,
            });

            filter.save();
        }

        let categories = await Category.find().skip(skip).limit(limit);

        if (categories.length === 0) {
            return null;
        }

        categories = categories.map((x) => {

            let title = x.name;
            if (filter.categories.indexOf(x.name) !== -1) {
                title = "☑️ " + title;
            }

            return [
                Markup.callbackButton(
                    title,
                    JSON.stringify({
                        n: x.name,
                        l: limit,
                        s: skip,
                    })
                ),
            ];
        })

        const keyboard = [
            ...categories,
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
            [
                Markup.callbackButton(
                    "Back",
                    JSON.stringify({
                        action: "back",
                    })
                ),
            ],
        ];

        let category = "Bсе";
        if (filter.categories.length > 0) {
            category = filter.categories.join(", ");
        }

        return {
            text: `Категории:\n${category}`,
            markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
        };


    } catch (e) {
        console.log(e.message);
    }
};

module.exports = changeCatalogCategory;
