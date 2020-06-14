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
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    inBasket:{
        type: Boolean,
        default: false,
        required: true
    }
});


module.exports = model('Order', schema);
