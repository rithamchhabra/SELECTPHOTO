const mongoose = require('mongoose');

const photoSchema = mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project',
    },
    url: {
        type: String,
        required: true,
    },
    public_id: {
        type: String,
        required: true,
    },
    isSelected: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
