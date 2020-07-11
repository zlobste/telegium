const {Schema, model} = require("mongoose");

const schema = new Schema({
    telegramId: {
        type: Number,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
        required: true,
    },
    autoposting: {
        type: Boolean,
        default: false,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "ChannelCategory",
        required: true,
    },
});

module.exports = model("Channel", schema);
