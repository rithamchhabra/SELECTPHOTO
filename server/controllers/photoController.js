const Photo = require('../models/Photo');
const Project = require('../models/Project');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// @desc    Upload photos to project
// @route   POST /api/projects/:projectId/photos
// @access  Private
const uploadPhotos = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const uploader = async (path) => await cloudinary.uploader.upload(path, {
            folder: `select-photo/${projectId}`,
        });

        const urls = [];
        const files = req.files;

        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path);

            const photo = await Photo.create({
                project: projectId,
                url: newPath.secure_url,
                public_id: newPath.public_id,
            });

            urls.push(photo);
            fs.unlinkSync(path); // Remove local temp file
        }

        res.status(201).json(urls);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get photos for a project
// @route   GET /api/projects/:projectId/photos
// @access  Public (should be protected or via special link, but Public for now for client view)
const getProjectPhotos = async (req, res) => {
    const { projectId } = req.params;
    const photos = await Photo.find({ project: projectId });
    res.json(photos);
};

// @desc    Toggle photo selection
// @route   PUT /api/projects/:projectId/photos/:id/selection
// @access  Public (Client)
const toggleSelection = async (req, res) => {
    const { projectId, id } = req.params;
    const project = await Project.findById(projectId);

    if (project.status === 'submitted' || project.status === 'archived') {
        return res.status(400).json({ message: 'Selection is locked' });
    }

    const photo = await Photo.findById(id);

    if (!photo) {
        return res.status(404).json({ message: 'Photo not found' });
    }

    // Check limit
    if (!photo.isSelected) {
        const selectedCount = await Photo.countDocuments({ project: projectId, isSelected: true });
        if (selectedCount >= project.maxSelection) {
            return res.status(400).json({ message: 'Selection limit reached' });
        }
    }

    photo.isSelected = !photo.isSelected;
    await photo.save();

    res.json(photo);
};

// @desc    Delete single photo
// @route   DELETE /api/projects/:projectId/photos/:id
// @access  Private
const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        const project = await Project.findById(photo.project);

        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (photo.public_id) {
            await cloudinary.uploader.destroy(photo.public_id);
        }

        await photo.deleteOne();

        res.json({ message: 'Photo removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { uploadPhotos, getProjectPhotos, toggleSelection, deletePhoto };


