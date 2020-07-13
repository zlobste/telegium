const Telegraf = require("telegraf");
const Markup = require("telegraf/markup");
const {Extra} = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    const keyboard = Markup.inlineKeyboard([
        [Markup.urlButton("back", "back.com")],
    ]);

    ctx.telegram
        .forwardMessage(
            ctx.update.message.chat.id,
            ctx.update.message.chat.id,
            ctx.update.message.message_id,
            Extra.markup(keyboard)
        )
        .catch((e) => console.log(e.message));

    ctx.replyWithPoll("Your favorite math constant", ["x", "e", "π", "φ", "γ"]);
});

bot.launch();
