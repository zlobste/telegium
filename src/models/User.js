const {Schema, model} = require('mongoose');

const schema = new Schema({
    telegramId: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        required: true
    }
});


module.exports = model('User', schema);