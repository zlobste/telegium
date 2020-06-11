const {Schema, model} = require('mongoose');

const schema = new Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        default: 'user'
    }
});


module.exports = model('User', schema);