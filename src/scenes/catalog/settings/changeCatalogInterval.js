const { Extra, Markup } = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Filter = require("../../../models/Filter");

const changeCatalogInterval = new Scene("changeCatalogInterval");

changeCatalogInterval.enter(async (ctx) => {
  try {
    await ctx.answerCbQuery();
    let filter = await Filter.findOne({
      userId: ctx.update.callback_query.message.chat.id,
    });

    if (filter) {
      const keyboard = [
        [
          Markup.callbackButton(
            "Количество подписчиков",
            "changeMembersCountInterval"
          ),
        ],
        [Markup.callbackButton("Стоимость поста", "changePostCostInterval")],
        [Markup.callbackButton("Back", "back")],
      ];

      await ctx.editMessageText(
        `Интервал:\nЦена поста: ${filter.interval.cost.start} - ${filter.interval.cost.finish} ₽\nПодписчики: ${filter.interval.members.start} - ${filter.interval.members.finish}\n\nИзменить интервал:`,
        Extra.markdown().markup((m) => m.inlineKeyboard(keyboard))
      );
    } else {
      return ctx.reply("Ошибка!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

changeCatalogInterval.on("callback_query", async (ctx) => {
  try {
    const data = ctx.update.callback_query.data;

    if (data === "back") {
      await ctx.scene.enter("catalog");
    } else if (data === "changeMembersCountInterval") {
      await ctx.scene.enter("changeMembersCountInterval");
    } else if (data === "changePostCostInterval") {
      await ctx.scene.enter("changePostCostInterval");
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = changeCatalogInterval;
