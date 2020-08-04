const Scene = require("telegraf/scenes/base");
const changeCategory = new Scene("changeCategory");
const Category = require("../../../models/Category");
const Channel = require("../../../models/Channel");
const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");

changeCategory.enter(async (ctx) => {
    try {

        await ctx.answerCbQuery();
        const data = JSON.parse(ctx.update.callback_query.data);

        let categories = await Category.find()


        const keyboard = [
            [
                Markup.callbackButton(
                    "Back",
                    JSON.stringify({
                        action: "back",
                        id: data.id,
                    })),
            ],
        ];


        if (categories) {
            categories.forEach(x => {
                keyboard.push(
                    [
                        Markup.callbackButton(
                            x.name,
                            JSON.stringify({
                                id: data.id,
                                name: x.name,
                            })),
                    ]
                )
            })
        } else {
            await ctx.editMessageText("Мы ещё не дорбавили категории");
        }


        const channel = await Channel.findOne({telegramId: data.id});


        await ctx.editMessageText(
            `Ваш канал относится к категории: ${channel.category}\n\nВы можете выбрать только 1 категорию`,
            Extra.markdown().markup((m) => m.inlineKeyboard(keyboard))
        );


    } catch (e) {
        console.log(e.message);
    }
});


changeCategory.on("callback_query", async (ctx) => {
    try {
        const data = JSON.parse(ctx.update.callback_query.data);

        if (data.action === "back") {

            await ctx.scene
                .enter("channelSettings")
                .catch((e) => console.log(e.message));
        } else {
            if (data.name) {

                const channel = await Channel.findOne({telegramId: data.id});
                channel.category = data.name
                await channel.save()

                await ctx.scene.enter("changeCategory").catch((e) => console.log(e.message));

            }
        }
    } catch (e) {
        console.log(e.message);
    }
});

module.exports = changeCategory;