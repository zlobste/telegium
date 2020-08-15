const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Channel = require("../../models/Channel");
const viewChannel = new Scene("viewChannel");

viewChannel.enter(async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "getChannel" || data.action === "back") {
      const channel = await Channel.findOne({
        telegramId: data.id,
        userId: ctx.update.callback_query.message.chat.id,
      });

      if (channel) {
        const info = await ctx.tg.getChat(data.id);
        const countOfMembers = await ctx.tg.getChatMembersCount(data.id);

        await ctx.editMessageText(
            `ID: ${info.id}\nTitle: ${info.title}\nDescription: ${
                info.description || "-"
            }\nCategory: ${
                channel.category
            }\nMembers count: ${countOfMembers}\nAutoposting: ${
                channel.autoposting
            }\nPost price: ${channel.price}\nTime of active post: ${
                channel.timeOfActivePost.split(":")[0]
            } часов ${channel.timeOfActivePost.split(":")[1]} минут`,
            Extra.markdown().markup((m) =>
                m.inlineKeyboard([
                    [
                        Markup.urlButton("Go to Channel", info.invite_link),
                        Markup.callbackButton("Back", "back"),
                    ],
                    [
                        Markup.callbackButton(
                            "Channel settings",
                            JSON.stringify({
                                action: "channelSettings",
                                id: data.id,
                            })
                        ),
                    ],
                ])
            )
        );
      } else {
        await ctx.reply("Ошибка! Нет такого канала!");
      }
    }
  } catch (e) {
    console.log(e.message);
  }
});

viewChannel.action("back", async (ctx) => {
    try {
        await ctx.scene.enter("userChannels");
    } catch (e) {
        console.log(e.message);
    }
});

viewChannel.on("callback_query", async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "channelSettings") {
        await ctx.scene.enter("channelSettings");
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = viewChannel;
