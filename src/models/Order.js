const { Schema, model } = require("mongoose");

const schema = new Schema({
  channelId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    default: "",
  },
  cost: {
    type: Number,
    default: 100,
  },
  timePoint: {
    type: String,
    default: "12:00",
  },
  inBasket: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("Order", schema);
