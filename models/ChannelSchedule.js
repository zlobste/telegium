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
    start: {
        type: Date,
        required: true
    },
    finish: {
        type: Date,
        required: true
    },
    weekDay: {
        type: Number,
        required: true
    },
    onlyOneOrder: {
        type: Boolean,
        default: true,
        required: true
    }
});


module.exports = model('ChannelSchedule', schema);
