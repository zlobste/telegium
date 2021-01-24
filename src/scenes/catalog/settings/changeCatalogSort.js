const Scene = require("telegraf/scenes/base");
const Filter = require("../../../models/Filter");
const Markup = require("telegraf/markup");
const { Extra } = require("telegraf");

const changeCatalogSort = new Scene("changeCatalogSort");

changeCatalogSort.enter(async (ctx) => {
  try {
    await ctx.answerCbQuery();

    let filter = await Filter.findOne({
      userId: ctx.update.callback_query.message.chat.id,
    });
    if (filter) {
      let sorting;
      let byCostIncrease = "По увеличению цены";
      let byCostDecrease = "По уменьшению цены";
      let byMembersIncrease = "По увеличению подписчиков";
      let byMembersDecrease = "По уменьшению подписчиков";

      if (filter.sort.byCostIncrease) {
        sorting = byCostIncrease;
        byCostIncrease = "☑️ " + byCostIncrease;
      } else if (filter.sort.byCostDecrease) {
        sorting = byCostDecrease;
        byCostDecrease = "☑️ " + byCostDecrease;
      } else if (filter.sort.byMembersIncrease) {
        sorting = byMembersIncrease;
        byMembersIncrease = "☑️ " + byMembersIncrease;
      } else {
        sorting = byMembersDecrease;
        byMembersDecrease = "☑️ " + byMembersDecrease;
      }

      const keyboard = [
        [Markup.callbackButton(byCostIncrease, "byCostIncrease")],
        [Markup.callbackButton(byCostDecrease, "byCostDecrease")],
        [Markup.callbackButton(byMembersIncrease, "byMembersIncrease")],
        [Markup.callbackButton(byMembersDecrease, "byMembersDecrease")],
        [Markup.callbackButton("Back", "back")],
      ];

      await ctx.editMessageText(
        `Сортировка: ${sorting}`,
        Extra.markdown().markup((m) => m.inlineKeyboard(keyboard))
      );
    } else {
      await ctx.reply("Error!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

changeCatalogSort.on("callback_query", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const action = ctx.update.callback_query.data;

    if (action === "back") {
      await ctx.scene.enter("catalog");
    } else {
      let filter = await Filter.findOne({
        userId: ctx.update.callback_query.message.chat.id,
      });

      if (!filter) {
        filter = new Filter({
          userId: ctx.update.callback_query.message.chat.id,
        });
        await filter.save();
      }

      filter.sort.byCostIncrease = false;
      filter.sort.byCostDecrease = false;
      filter.sort.byMembersIncrease = false;
      filter.sort.byMembersDecrease = false;

      if (action === "byCostIncrease") {
        filter.sort.byCostIncrease = true;
      } else if (action === "byCostDecrease") {
        filter.sort.byCostDecrease = true;
      } else if (action === "byMembersIncrease") {
        filter.sort.byMembersIncrease = true;
      } else {
        filter.sort.byMembersDecrease = true;
      }

      await filter.save();

      try {
        await ctx.scene.enter("changeCatalogSort");
      } catch (e) {
        console.log(e.message);
      }
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = changeCatalogSort;
