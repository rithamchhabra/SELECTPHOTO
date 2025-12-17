const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    maxSelection: {
        type: Number,
        default: 50,
    },
    status: {
        type: String,
        enum: ['active', 'submitted', 'archived'],
        default: 'active',
    },
    galleryLink: {
        type: String,
    },
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
