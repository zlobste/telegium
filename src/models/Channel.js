const {Schema, model} = require("mongoose");

const schema = new Schema({
    telegramId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
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
        //required: true,
    },
    completed: {
        type: Boolean,
        default: false,
        required: true,
    },
});

module.exports = model("Channel", schema);
