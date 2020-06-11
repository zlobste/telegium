const {Schema, model} = require('mongoose');

const schema = new Schema({

    channelId: {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    cost: {
        type: Number,
        default: 0,
        required: true
    },
    timePoint: {
        type: Date,
        required: true
    },
    posts: {
        type: [Schema.Types.ObjectId],
        ref: 'Post',
        required: true
    }
});


module.exports = model('Order', schema);
