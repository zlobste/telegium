const { Schema, model } = require("mongoose");

const schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    default: [],
  },
  interval: {
    cost: {
      start: {
        type: Number,
        default: 100,
      },
      finish: {
        type: Number,
        default: 10000,
      },
    },
    members: {
      start: {
        type: Number,
        default: 500,
      },
      finish: {
        type: Number,
        default: 20000,
      },
    },
  },
  sort: {
    byCostIncrease: {
      type: Boolean,
      default: false,
    },
    byCostDecrease: {
      type: Boolean,
      default: false,
    },
    byMembersIncrease: {
      type: Boolean,
      default: false,
    },
    byMembersDecrease: {
      type: Boolean,
      default: true,
    },
  },
});

module.exports = model("Filter", schema);
