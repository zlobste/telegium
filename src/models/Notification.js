const {Schema, model} = require("mongoose");

const schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    info: {
        type: String,
        required: true,
    },
    hasRead: {
        type: Boolean,
        default: false,
        required: true,
    },
});

module.exports = model("Notification", schema);
