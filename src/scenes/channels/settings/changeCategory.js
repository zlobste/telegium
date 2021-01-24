const Scene = require("telegraf/scenes/base");
const Category = require("../../../models/Category");
const Channel = require("../../../models/Channel");
const Markup = require("telegraf/markup");
const { Extra } = require("telegraf");

const changeCategory = new Scene("changeCategory");

changeCategory.enter(async (ctx) => {
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

changeCategory.on("callback_query", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "back") {
      await ctx.scene.enter("channelSettings");
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
        const channel = await Channel.findOne({ telegramId: data.id });
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

    const channel = await Channel.findOne({ telegramId: id });

    if (channel) {
      return {
        text: `Ваш канал относится к категории: ${channel.category}\n\nВы можете выбрать только 1 категорию`,
        markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
      };
    } else {
      return null;
    }
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = changeCategory;
