const Scene = require("telegraf/scenes/base");
const Channel = require("../../../models/Channel");

const changeAutoposting = new Scene("changeAutoposting");

changeAutoposting.enter(async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.callback_query.data);

    let channel = await Channel.findOne({ telegramId: data.id });

    if (channel) {
      channel.autoposting = !channel.autoposting;
      await channel.save();

      await ctx.scene.enter("channelSettings");
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = changeAutoposting;
