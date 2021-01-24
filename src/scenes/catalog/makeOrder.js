const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const makeOrder = new Scene("makeOrder");

makeOrder.enter(async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data) {
      await ctx.editMessageText(
        `Вы уверены, что ходитете заказать рекламу ?`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([
            [
              m.callbackButton(
                "Yes",
                JSON.stringify({
                  action: "makeOrder",
                })
              ),
              m.callbackButton(
                "Back",
                JSON.stringify({
                  action: "backToCatalogView",
                })
              ),
            ],
          ])
        )
      );
    }
  } catch (e) {
    console.log(e.message);
  }
});

makeOrder.on("callback_query", async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.callback_query.data);
    if (data.action === "backToCatalogView") {
      await ctx.scene.enter("viewChannel");
    } else if (data.action === "makeOrder") {
      // make order logic
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = makeOrder;
