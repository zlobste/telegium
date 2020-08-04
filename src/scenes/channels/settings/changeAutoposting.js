const Scene = require("telegraf/scenes/base");
const changeAutoposting = new Scene("changeAutoposting");
const Channel = require("../../../models/Channel");

changeAutoposting.enter(async (ctx) => {
  try {
      const data = JSON.parse(ctx.update.callback_query.data);

      let channel = await Channel.findOne({telegramId: data.id});

      channel.autoposting = !channel.autoposting;
      await channel.save();

      await ctx.scene
          .enter("channelSettings")
          .catch((e) => console.log(e.message));
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = changeAutoposting;
