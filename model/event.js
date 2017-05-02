const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EventSchema = new Schema({
    eventId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    actor: {
        type: String
    },
    repoId: {
        type: String,
        index: true
    },
    eventDate: {
        type: Date
    },
    public: {
        type: Boolean
    }

});

module.exports = mongoose.model('Event', EventSchema);