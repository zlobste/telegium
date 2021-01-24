const { Extra } = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Channel = require("../../../models/Channel");

const changePrice = new Scene("changePrice");

changePrice.enter(async (ctx) => {
  try {
    let data;
    let channel;

    if (ctx.update.callback_query) {
      data = JSON.parse(ctx.update.callback_query.data);
    }

    if (data) {
      channel = await Channel.findOne({ telegramId: data.id });
      channel.changeCompleted = false;
      await channel.save();
    } else {
      channel = await Channel.findOne({
        userId: ctx.update.message.from.id,
        changeCompleted: false,
      });

      if (channel) {
        data = {
          id: channel.telegramId,
          action: "reply",
        };
      } else {
        return ctx.reply("Ошибка! Канал не найден в системе!");
      }
    }

    if (channel) {
      const chatInfo = await ctx.tg.getChat(data.id);

      if (data.action === "reply") {
        await ctx.reply(
          `Канал: ${chatInfo.title}\nТеущая стоимость поста: ${channel.price} ₽\n\nПришлите новую цену за размещение рекламного поста на Вашем канале\nФормат: 49.99 или 49`,
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              [
                m.callbackButton(
                  "Back",
                  JSON.stringify({
                    action: "back",
                    id: data.id,
                  })
                ),
              ],
            ])
          )
        );
      } else {
        await ctx.answerCbQuery();
        await ctx.editMessageText(
          `Канал: ${chatInfo.title}\nТеущая стоимость поста: ${channel.price} ₽\n\nПришлите новую цену за размещение рекламного поста на Вашем канале\nФормат: 49.99 или 49`,
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              [
                m.callbackButton(
                  "Back",
                  JSON.stringify({
                    action: "back",
                    id: data.id,
                  })
                ),
              ],
            ])
          )
        );
      }
    } else {
      return ctx.reply("Ошибка! Канал не найден в системе!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

changePrice.start(async (ctx) => {
  try {
    let channel = await Channel.findOne({
      userId: ctx.update.message.from.id,
      changeCompleted: false,
    });

    if (channel) {
      channel.changeCompleted = true;
      await channel.save();
    }

    await ctx.scene.enter("main");
  } catch (e) {
    console.log(e.message);
  }
});

changePrice.on("message", async (ctx) => {
  try {
    let price = Number(ctx.update.message.text);

    if (price) {
      price = Number(price.toFixed(2));
      let channel = await Channel.findOne({
        userId: ctx.update.message.from.id,
        changeCompleted: false,
      });

      if (channel) {
        channel.price = price;
        await channel.save();

        await ctx.scene.enter("changePrice");
      }
    } else {
      return await ctx.reply("Неправильный формат вода!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

changePrice.on("callback_query", async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "back") {
      const channel = await Channel.findOne({ telegramId: data.id });
      channel.changeCompleted = true;
      await channel.save();

      await ctx.scene.enter("channelSettings");
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = changePrice;
