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
      type: String,
      required: false,
      //required: true,
  },
  timeOfActivePost: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    default: 0,
    required: true,
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
