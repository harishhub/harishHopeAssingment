const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const RepositorySchema = new Schema({
    repoId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String
    }
});

module.exports = mongoose.model('Repository', RepositorySchema);