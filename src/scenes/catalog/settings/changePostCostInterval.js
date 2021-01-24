const { Extra, Markup } = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Filter = require("../../../models/Filter");

const changePostCostInterval = new Scene("changePostCostInterval");

changePostCostInterval.enter(async (ctx) => {
  try {
    let filter;
    const keyboard = [
      [
        Markup.callbackButton("Back", "back"),
        Markup.callbackButton("To catalog", "catalog"),
      ],
    ];

    if (ctx.update.callback_query) {
      filter = await Filter.findOne({
        userId: ctx.update.callback_query.message.chat.id,
      });

      if (filter) {
        await ctx.answerCbQuery();
        await ctx.editMessageText(
          `Цена поста: ${filter.interval.cost.start} - ${filter.interval.cost.finish} ₽\n\nЧтобы изменить интервал пришлите новый в формате 500-1000`,
          Extra.markdown().markup((m) => m.inlineKeyboard(keyboard))
        );
      }
    } else {
      filter = await Filter.findOne({ userId: ctx.update.message.chat.id });

      if (filter) {
        await ctx.reply(
          `Цена поста: ${filter.interval.cost.start} - ${filter.interval.cost.finish} ₽\n\nЧтобы изменить интервал пришлите новый в формате 500-1000`,
          Extra.markdown().markup((m) => m.inlineKeyboard(keyboard))
        );
      }
    }
  } catch (e) {
    console.log(e.message);
  }
});

changePostCostInterval.on("message", async (ctx) => {
  try {
    let cost = ctx.update.message.text;

    if (cost) {
      cost = cost.split("-");
      if (cost.length !== 2) {
        return await ctx.reply("Неправильный формат вода!");
      }

      let start = Number(Number(cost[0]).toFixed(2));
      let finish = Number(Number(cost[1]).toFixed(2));

      if (start && finish) {
        if (start > finish) {
          let temp = start;
          start = finish;
          finish = temp;
        }

        let filter = await Filter.findOne({
          userId: ctx.update.message.chat.id,
        });

        if (filter) {
          filter.interval.cost.start = start;
          filter.interval.cost.finish = finish;
          await filter.save();
        }

        await ctx.scene.enter("changePostCostInterval");
      } else {
        return await ctx.reply("Неправильный формат вода!");
      }
    }
  } catch (e) {
    console.log(e.message);
  }
});

changePostCostInterval.on("callback_query", async (ctx) => {
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

module.exports = changePostCostInterval;
