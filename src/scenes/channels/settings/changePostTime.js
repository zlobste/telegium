const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const changePostTime = new Scene("changePostTime");
const Channel = require("../../../models/Channel");

changePostTime.enter(async (ctx) => {
  try {
    let data;
    let channel;

    if (ctx.update.callback_query) {
      data = JSON.parse(ctx.update.callback_query.data);
    }

    if (data) {
        channel = await Channel.findOne({telegramId: data.id});
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
            `Канал: ${chatInfo.title}\nТекущее время жизни поста: ${
                channel.timeOfActivePost.split(":")[0]
            } часов ${
                channel.timeOfActivePost.split(":")[1]
            } минут\n\nПришлите новое время жизни рекламного поста на Вашем канале\nФормат: 3 (3 часа) или 3:30 (3 часа 30 минут)\n\nP.S. Минимальное евремя жизни поста - 1 час`,
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
            `Канал: ${chatInfo.title}\nТекущее время жизни поста: ${
                channel.timeOfActivePost.split(":")[0]
            } часов ${
                channel.timeOfActivePost.split(":")[1]
            } минут\n\nПришлите новое время жизни рекламного поста на Вашем канале\nФормат: 3 (3 часа) или 3:30 (3 часа 30 минут)\n\nP.S. Минимальное евремя жизни поста - 1 час`,
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

changePostTime.start(async (ctx) => {
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

changePostTime.on("message", async (ctx) => {
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
        userId: ctx.update.message.from.id,
        changeCompleted: false,
      });

      if (channel) {
          channel.timeOfActivePost = time;
          await channel.save();

          await ctx.scene.enter("changePostTime");
      }
    } else {
      return await ctx.reply("Неправильный формат вода!");
    }
  } catch (e) {
    console.log(e.message);
  }
});

changePostTime.on("callback_query", async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "back") {
        const channel = await Channel.findOne({telegramId: data.id});
        channel.changeCompleted = true;
        await channel.save();

        await ctx.scene.enter("channelSettings");
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = changePostTime;
