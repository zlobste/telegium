const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const setPrice = new Scene("setPrice");
const Channel = require("../../../models/Channel");

setPrice.enter(async (ctx) => {
  try {
    let data;
    let channel;

    if (ctx.update.callback_query) {
      data = JSON.parse(ctx.update.callback_query.data);

      channel = await Channel.findOne({
        userId: ctx.update.callback_query.message.chat.id,
        additionCompleted: false,
      });
    } else {
      channel = await Channel.findOne({
        userId: ctx.update.message.chat.id,
        additionCompleted: false,
      });

      data = {
        id: channel.telegramId,
        action: "reply",
      };
    }

    if (channel) {
      const chatInfo = await ctx.tg.getChat(data.id);

      if (data.action === "reply") {
        if (channel.price) {
          await ctx.reply(
              `Канал: ${chatInfo.title}\nТеущая стоимость поста: ${channel.price} ₽\n\nПришлите новую цену за размещение рекламного поста на Вашем канале\nФормат: 49.99 или 49`,
              Extra.HTML().markup((m) =>
                  m.inlineKeyboard([
                    [
                      m.callbackButton(
                          "Next step",
                          JSON.stringify({
                            action: "nextStep",
                          })
                      ),
                    ],
                  ])
              )
          );
        } else {
          await ctx.reply(
              `Канал: ${chatInfo.title}\n\nПришлите цену за размещение рекламного поста на Вашем канале\nФормат: 49.99 или 49`
          );
        }
      } else {
        await ctx.answerCbQuery();

        if (channel.price) {
          await ctx.editMessageText(
              `Канал: ${chatInfo.title}\nТеущая стоимость поста: ${channel.price} ₽\n\nПришлите новую цену за размещение рекламного поста на Вашем канале\nФормат: 49.99 или 49`,
              Extra.HTML().markup((m) =>
                  m.inlineKeyboard([
                    [
                      m.callbackButton(
                          "Next step",
                          JSON.stringify({
                            action: "nextStep",
                          })
                      ),
                    ],
                  ])
              )
          );
        } else {
          await ctx.editMessageText(
              `Канал: ${chatInfo.title}\n\nПришлите цену за размещение рекламного поста на Вашем канале\nФормат: 49.99 или 49`
          );
        }
      }
    } else {
      return ctx.reply("Ошибка 2 ! Канал не найден в системе!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

setPrice.on("message", async (ctx) => {
  try {
    let price = Number(ctx.update.message.text);

    if (price) {
      price = Number(price.toFixed(2));
      let channel = await Channel.findOne({
        userId: ctx.update.message.chat.id,
        additionCompleted: false,
      });

      if (channel) {
        channel.price = price;
        await channel.save();

        await ctx.scene.enter("setPrice").catch((e) => console.log(e.message));
      }
    } else {
      return await ctx.reply("Неправильный формат вода!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

setPrice.on("callback_query", async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "nextStep") {
      await ctx.scene.enter("setPostTime").catch((e) => console.log(e.message));
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = setPrice;
