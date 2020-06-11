const {Schema, model} = require('mongoose');

const schema = new Schema({
    telegramId: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orders: {
        type: [Schema.Types.ObjectId],
        ref: 'Order',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    }
});


module.exports = model('Post', schema);
