const Scene = require("telegraf/scenes/base");
const setCategory = new Scene("setCategory");
const Category = require("../../../models/Category");
const Channel = require("../../../models/Channel");
const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");

setCategory.enter(async (ctx) => {
  try {
    const channel = await Channel.findOne({
      userId: ctx.update.message.chat.id,
      additionCompleted: false,
    })
        .sort({_id: -1})
        .limit(1);

    if (channel) {
      const data = {id: channel.telegramId};

      const categories = await getCategories(data.id);
      if (categories) {
        await ctx.reply(categories.text, categories.markup);
      } else {
        return await ctx.editMessageText("Ошибка! Канал не найден");
      }
    } else {
      return await ctx.editMessageText("Мы ещё не дорбавили категории");
    }
  } catch (e) {
    console.log(e.message);
  }
});

setCategory.on("callback_query", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "nextStep") {
      const channel = await Channel.findOne({telegramId: data.id});

      if (channel) {
        if (!channel.category) {
          await ctx.reply("Вы не выбрали категорию Вашего канала!");
        } else {
          await ctx.scene
              .enter("setPrice")
              .catch((e) => console.log(e.message));
        }
      }
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

    const channel = await Channel.findOne({telegramId: id});
    let additionButton = [];

    if (channel.category) {
      additionButton = [
        [
          Markup.callbackButton(
              "Next step",
              JSON.stringify({
                action: "nextStep",
                id: id,
              })
          ),
        ],
      ];
    }

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
      ...additionButton,
    ];

    if (channel) {
      if (channel.category) {
        return {
          text: `Ваш канал относится к категории: ${channel.category}\n\nВы можете выбрать только 1 категорию`,
          markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
        };
      } else {
        return {
          text: `Выберите тематику Вашего канала!\n\nВы можете выбрать только 1 категорию`,
          markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
        };
      }
    } else {
      return null;
    }
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = setCategory;
