const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Channel = require("../../../models/Channel");
const addChannel = new Scene("addChannel");

addChannel.enter(async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        "Для добавления канала нужно соблюдать условия:\n\n" +
        "* Вы должны быть владельцем канала который добавляете\n" +
        "* Добавьте этого бота как администратора канала с возможностью публикации сообщений\n" +
        "* Пришлите сюда сообщение из канала который хотите добавить",
        Extra.HTML().markup((m) =>
            m.inlineKeyboard([[m.callbackButton("back", "back")]])
        )
    );
  } catch (e) {
    console.log(e.message);
  }
});

addChannel.action("back", async (ctx) => {
  await ctx.scene.enter("userChannels").catch((e) => console.log(e.message));
});

addChannel.on("message", async (ctx) => {
  try {
    if (ctx.update.message) {
      if (ctx.update.message.forward_from_chat) {
        const admins = await ctx.tg.getChatAdministrators(
            ctx.update.message.forward_from_chat.id
        );

        if (admins) {
          const userAdmin = admins.find(
              (x) => x.user.id === ctx.update.message.from.id
          );

          if (userAdmin && userAdmin.status === "creator") {
            const botAdmin = admins.find(
                (x) =>
                    x.user.is_bot && x.user.username === process.env.BOT_USERNAME
            );

            if (botAdmin) {
              if (botAdmin.can_post_messages && botAdmin.can_delete_messages) {
                const candidate = await Channel.findOne({
                  telegramId: ctx.update.message.forward_from_chat.id,
                  userId: ctx.update.message.from.id,
                });

                if (!candidate) {
                  const newChannel = new Channel({
                    telegramId: ctx.update.message.forward_from_chat.id,
                    userId: ctx.update.message.from.id,
                  });

                  await newChannel.save();
                  await ctx.tg.exportChatInviteLink(newChannel.telegramId);

                  /*await ctx.scene
                      .enter("userChannels")
                      .catch((e) => console.log(e.message));*/

                  await ctx.scene
                      .enter("setCategory")
                      .catch((e) => console.log(e.message));
                } else {
                  return await ctx.reply("Вы уже добавили этот канал раньше");
                }
              } else {
                return await ctx.reply(
                    "Бот не может добавлять посты и удалять их!\n\n" +
                    "Добавьте эти возможности в настройках администраторов канала"
                );
              }
            } else {
              return await ctx.reply(
                  "Бот не администратор этого канала\n\n" +
                  "Добавьте бота как администратора канала и дайте ему возможность добавлять и удалять посты"
              );
            }
          } else {
            return await ctx.reply("Вы не являетесь владельцем этого канала!");
          }
        }
      } else {
        await ctx.reply("Это сообщение не является пересланным из канала!");
      }
    }
  } catch (e) {
    await ctx.reply("Бот не является членом этого канала!");
    console.log(e.message);
  }
});

module.exports = addChannel;
