const { Extra } = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Channel = require("../../../models/Channel");

const setPostTime = new Scene("setPostTime");

setPostTime.enter(async (ctx) => {
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

      if (channel) {
        data = {
          id: channel.telegramId,
          action: "reply",
        };
      } else {
        return ctx.reply("Ошибка 1 ! Канал не найден в системе!");
      }
    }

    if (channel) {
      const chatInfo = await ctx.tg.getChat(channel.telegramId);

      if (data.action === "reply") {
        await ctx.reply(
          `Канал: ${chatInfo.title}\nТекущее время жизни поста: ${
            channel.timeOfActivePost.split(":")[0]
          } часов ${
            channel.timeOfActivePost.split(":")[1]
          } минут\n\nПришлите новое время жизни рекламного поста на Вашем канале\nФормат: 3 (3 часа) или 3:30 (3 часа 30 минут)\n\nP.S. Минимальное евремя жизни поста - 1 час`,
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([
              [
                m.callbackButton(
                  "Finish",
                  JSON.stringify({
                    action: "finish",
                    id: channel.telegramId,
                  })
                ),
              ],
            ])
          )
        );
      } else {
        await ctx.answerCbQuery();
        await ctx.editMessageText(
          `Канал: ${chatInfo.title}\n\nПришлите время жизни рекламного поста на Вашем канале\nФормат: 3 (3 часа) или 3:30 (3 часа 30 минут)\n\nP.S. Минимальное евремя жизни поста - 1 час`
        );
      }
    } else {
      return ctx.reply("Ошибка 2! Канал не найден в системе!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

setPostTime.on("message", async (ctx) => {
  try {
    let time = ctx.update.message.text;

    if (time) {
      time = time.split(":");
      if (time.length > 0 && time.length < 3) {
        let hours = "00";
        let minutes = "00";

        if (Number(time[0])) {
          hours = time[0];
        } else {
          return await ctx.reply("Неправильный формат вода!");
        }

        if (time.length === 2) {
          if (Number(time[1])) {
            minutes = time[1];
          } else {
            return await ctx.reply("Неправильный формат вода!");
          }
        }

        if (Number(minutes) > 59) {
          return await ctx.reply(
            "Вы можете указать минуты только до 60 мин. Пришлите мне новое время жизни поста!"
          );
        }

        if (Number(hours) < 1) {
          return await ctx.reply(
            "Минимальное евремя жизни поста - 1 час. Пришлите мне новое время жизни поста!"
          );
        }
        time = hours + ":" + String(Number(minutes));
      } else {
        return await ctx.reply("Неправильный формат вода!");
      }

      let channel = await Channel.findOne({
        userId: ctx.update.message.chat.id,
        additionCompleted: false,
      });

      if (channel) {
        channel.timeOfActivePost = time;
        await channel.save();

        await ctx.scene.enter("setPostTime");
      }
    } else {
      return await ctx.reply("Неправильный формат вода!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

setPostTime.on("callback_query", async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "finish") {
      const channel = await Channel.findOne({ telegramId: data.id });
      channel.additionCompleted = true;
      await channel.save();

      await ctx.answerCbQuery();

      try {
        await ctx.scene.enter("userChannels");
      } catch (e) {
        console.log(e.message);
      }
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = setPostTime;
