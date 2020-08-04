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
  },
  autoposting: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
  },
  timeOfActivePost: {
    type: String,
  },
  price: {
    type: Number,
  },
  additionCompleted: {
    type: Boolean,
    default: false,
  },
  changeCompleted: {
    type: Boolean,
    default: true,
  },
});

module.exports = model("Channel", schema);
