const {Schema, model} = require("mongoose");

const schema = new Schema({
  telegramId: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  /*isActive: {
        type: Boolean,
        default: true,
        required: true
    }*/
});

module.exports = model("Post", schema);
