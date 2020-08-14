const {Schema, model} = require("mongoose");

const schema = new Schema({
    userId: {
        type: String,
        ref: "User",
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    oldBalance: {
        type: Number,
        required: true,
    },
    newBalance: {
        type: Number,
        required: true,
    },
});

module.exports = model("BalanceHistory", schema);
