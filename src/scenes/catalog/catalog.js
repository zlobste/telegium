const {Extra} = require("telegraf");
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const Channel = require("../../models/Channel");
const Filter = require("../../models/Filter");
const catalog = new Scene("catalog");

catalog.enter(async (ctx) => {
  try {
    await ctx.answerCbQuery();
    let keyboard = await getChannels(ctx, ctx.update.callback_query.message.chat.id);

    if (!keyboard) {
      keyboard = {
        text: "По вашему фильтру не найдено ни одного канала!",
        markup: Extra.markdown().markup((m) =>
            m.inlineKeyboard([
              [
                Markup.callbackButton("Category", "category"),
                Markup.callbackButton("Interval", "interval"),
                Markup.callbackButton("Sort", "sort"),
              ],
              [Markup.callbackButton("Back", "back")],
            ])
        ),
      };
    }

    await ctx.editMessageText(keyboard.text, keyboard.markup);

  } catch (e) {
    console.log(e.message);
  }
});

catalog.start(async (ctx) => {
    try {
        await ctx.scene.enter("main");
    } catch (e) {
        console.log(e.message);
    }
});

catalog.on("message", async (ctx) => {
    try {
        await ctx.tg.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
    } catch (e) {
        console.log(e.message);
    }
});

catalog.action("back", async (ctx) => {
    try {
        await ctx.scene.enter("main", ctx.state);
    } catch (e) {
        console.log(e.message);
    }
});

catalog.action("sort", async (ctx) => {
    try {
        await ctx.scene.enter("changeCatalogSort");
    } catch (e) {
        console.log(e.message);
    }
});

catalog.action("interval", async (ctx) => {
    try {
        await ctx.scene.enter("changeCatalogInterval");
    } catch (e) {
        console.log(e.message);
    }
});

catalog.action("category", async (ctx) => {
    try {
        await ctx.scene.enter("changeCatalogCategory");
    } catch (e) {
        console.log(e.message);
    }
});

catalog.on("callback_query", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    const data = JSON.parse(ctx.update.callback_query.data);

    if (data.action === "getChannelForOrder") {
        await ctx.scene.enter("viewChannel");
    } else if (data.action === "next") {
        const keyboard = await getChannels(
            ctx,
            ctx.update.callback_query.message.chat.id,
            data.skip + data.limit
        );

        if (keyboard) {
            await ctx.editMessageText(keyboard.text, keyboard.markup);
      }
    } else if (data.action === "previous" && data.skip > 0) {
      const keyboard = await getChannels(
          ctx,
          ctx.update.callback_query.message.chat.id,
          data.skip - data.limit
      );

      await ctx.editMessageText(keyboard.text, keyboard.markup);
    }
  } catch (e) {
    console.log(e.message);
  }
});

const getChannels = async (ctx, userId, skip = 0, limit = 5) => {
  try {
    let filter = await Filter.findOne({
      userId: userId,
    });

    if (!filter) {
      filter = new Filter({
        userId: userId,
      });

      await filter.save();
    }

    let channels = await Channel.find({
      changeCompleted: true,
      additionCompleted: true,
    });

    for (const chan of channels) {
      chan.countOfMembers = await ctx.tg.getChatMembersCount(chan.telegramId);
    }

    channels = channels.filter((x) => {
      if (filter.categories.length === 0) {
          return x.price >= filter.interval.cost.start &&
              x.price <= filter.interval.cost.finish &&
              x.countOfMembers >= filter.interval.members.start &&
              x.countOfMembers <= filter.interval.members.finish;
      } else {
          return filter.categories.indexOf(x.category) !== -1 &&
              x.price >= filter.interval.cost.start &&
              x.price <= filter.interval.cost.finish &&
              x.countOfMembers >= filter.interval.members.start &&
              x.countOfMembers <= filter.interval.members.finish;
      }
    });

    channels.sort((a, b) => {
      if (filter.sort.byCostIncrease) {
        if (a.price > b.price) {
          return 1;
        } else if (b.price > a.price) {
          return -1;
        }
        return 0;
      } else if (filter.sort.byCostDecrease) {
        if (a.price < b.price) {
          return 1;
        } else if (b.price < a.price) {
          return -1;
        }
        return 0;
      } else if (filter.sort.byMembersIncrease) {
        if (a.countOfMembers > b.countOfMembers) {
          return 1;
        } else if (b.countOfMembers > a.countOfMembers) {
          return -1;
        }
        return 0;
      } else if (filter.sort.byMembersDecrease) {
        if (a.countOfMembers < b.countOfMembers) {
          return 1;
        } else if (b.countOfMembers < a.countOfMembers) {
          return -1;
        }
        return 0;
      }
    });

    channels = channels.slice(skip, limit);

    if (channels.length === 0) {
      return null;
    }

    for (let i = 0; i < channels.length; i++) {
      let chat = await ctx.tg.getChat(channels[i].telegramId);
      channels[i].channelName = chat.title;
    }

    channels = channels.map((x) => {
      return [
        Markup.callbackButton(
            x.channelName,
            JSON.stringify({
                action: "getChannelForOrder",
                id: x.telegramId,
            })
        ),
      ];
    });

    const keyboard = [
      [
        Markup.callbackButton("Category", "category"),
        Markup.callbackButton("Interval", "interval"),
        Markup.callbackButton("Sort", "sort"),
      ],
      ...channels,
      [
        Markup.callbackButton(
            "Previous",
            JSON.stringify({
              action: "previous",
              limit: limit,
              skip: skip,
            })
        ),
        Markup.callbackButton(
            "Next",
            JSON.stringify({
              action: "next",
              limit: limit,
              skip: skip,
            })
        ),
      ],
      [Markup.callbackButton("Back", "back")],
    ];

    let filterCategories = "Bсе";
    if (filter.categories.length > 0) {
      filterCategories = filter.categories.join(", ");

    }

    let sorting = "";
    if (filter.sort.byCostIncrease) {
      sorting = "По увеличению цены";
    } else if (filter.sort.byCostDecrease) {
      sorting = "По уменьшению цены";
    } else if (filter.sort.byMembersIncrease) {
      sorting = "По увеличению подписчиков";
    } else if (filter.sort.byMembersDecrease) {
      sorting = "По уменьшению подписчиков";
    } else {
      return null;
    }

    return {
      text: `Категории:\n${filterCategories}\n\nИнтервал:\nЦена поста: ${filter.interval.cost.start} - ${filter.interval.cost.finish} ₽\nПодписчики: ${filter.interval.members.start} - ${filter.interval.members.finish}\n\nСортировка: ${sorting}`,
      markup: Extra.markdown().markup((m) => m.inlineKeyboard(keyboard)),
    };
  } catch (e) {
    console.log(e);
  }
};

module.exports = catalog;
