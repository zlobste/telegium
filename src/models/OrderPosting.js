const {Schema, model} = require("mongoose");

const schema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    timePoint: {
        type: Date,
        required: true,
    },
});

module.exports = model("OrderPosting", schema);
