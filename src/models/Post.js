const { Schema, model } = require("mongoose");

const schema = new Schema({
  telegramId: {
    type: Number,
  },
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "Post",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
    required: true,
  },
});

module.exports = model("Post", schema);
