const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Channel = require("../../models/Channel");
const Order = require("../../models/Order");
const viewChannel = new Scene("viewChannel");


viewChannel.enter(async (ctx) => {
  try {
      await ctx.answerCbQuery();
      const data = JSON.parse(ctx.update.callback_query.data);

      if (
          data.action === "getChannel" ||
          data.action === "back" ||
          data.action === "getChannelForOrder" ||
          data.action === "backToCatalogView"
      ) {

          let channel;

          if (data.action === "backToCatalogView") {

              const o = await Order.findOne({
                  userId: ctx.update.callback_query.message.chat.id,
                  completed: false
              }).sort({_id: -1}).limit(1);

              if (o) {

                  channel = await Channel.findOne({
                      telegramId: o.channelId,
                      userId: ctx.update.callback_query.message.chat.id,
                  });


                  if (channel) {
                      data.id = channel.telegramId;
                  }
              }

          } else {

              channel = await Channel.findOne({
                  telegramId: data.id,
                  userId: ctx.update.callback_query.message.chat.id,
              });
          }


          if (channel) {

              const info = await ctx.tg.getChat(data.id);
              const countOfMembers = await ctx.tg.getChatMembersCount(data.id);

              if (data.action === "getChannelForOrder" || data.action === "backToCatalogView") {


                  await ctx.editMessageText(
                      `Title: ${info.title}\nDescription: ${
                          info.description || "-"
                      }\nCategory: ${
                          channel.category
                      }\nMembers count: ${countOfMembers}\nPost price: ${
                          channel.price}\nTime of active post: ${
                          channel.timeOfActivePost.split(":")[0]
                      } часов ${channel.timeOfActivePost.split(":")[1]} минут`,
                      Extra.markdown().markup((m) =>
                          m.inlineKeyboard([
                              [
                                  Markup.urlButton("Go to Channel", info.invite_link),
                                  Markup.callbackButton("Back", "backToCatalog"),
                              ],
                              [
                                  Markup.callbackButton(
                                      "Make order",
                                      JSON.stringify({
                                          action: "makeOrder",
                                          id: data.id,
                                      })
                                  ),
                              ],
                          ])
                      )
                  );
              } else {

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

              }
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

viewChannel.action("backToCatalog", async (ctx) => {
    try {
        await ctx.scene.enter("catalog");
    } catch (e) {
        console.log(e.message);
    }
});

viewChannel.on("callback_query", async (ctx) => {
    try {
        const data = JSON.parse(ctx.update.callback_query.data);

        if (data.action === "channelSettings") {
            await ctx.scene.enter("channelSettings");
        } else if (data.action === "makeOrder") {

            let order = await Order.findOne({
                userId: ctx.update.callback_query.message.chat.id,
                channelId: data.id,
                completed: false
            });

            if (!order) {
                order = new Order({
                    userId: ctx.update.callback_query.message.chat.id,
                    channelId: data.id,
                })

                await order.save();
            }

            await ctx.scene.enter("choosePostForOrder");
        }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = viewChannel;
