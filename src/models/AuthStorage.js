const { Schema, model } = require("mongoose");

const schema = new Schema({
  storage: {
    type: Object,
  },
});

module.exports = model("AuthStorage", schema);
