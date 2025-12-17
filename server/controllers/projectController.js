const Project = require('../models/Project');
const Photo = require('../models/Photo');
const archiver = require('archiver');
const axios = require('axios');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    const { title, clientName, maxSelection } = req.body;

    if (!title || !clientName) {
        res.status(400).json({ message: 'Please fill in all fields' });
        return;
    }

    const project = await Project.create({
        user: req.user._id,
        title,
        clientName,
        maxSelection,
    });

    res.status(201).json(project);
};

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    const projects = await Project.find({ user: req.user._id, status: { $ne: 'archived' } }).sort({ createdAt: -1 });
    res.json(projects);
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private (Photographer) / Public (Client - partially)
const getProjectById = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        res.json(project);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Submit selection (Lock project)
// @route   PUT /api/projects/:id/submit
// @access  Public (Client)
const submitSelection = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    project.status = 'submitted';
    await project.save();

    res.json({ message: 'Selection submitted successfully', project });
};

// @desc    Download selected photos as ZIP
// @route   GET /api/projects/:id/download-selected
// @access  Private
const downloadSelected = async (req, res) => {
    try {
        const { id } = req.params;
        const photos = await Photo.find({ project: id, isSelected: true });

        if (!photos.length) {
            return res.status(400).json({ message: 'No photos selected' });
        }

        const project = await Project.findById(id);
        const zipName = `Selected_${project.title.replace(/ /g, '_')}_${project.clientName}.zip`;

        res.attachment(zipName);

        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                console.warn(err);
            } else {
                throw err;
            }
        });

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(res);

        for (const photo of photos) {
            // Get image stream from Cloudinary
            const response = await axios.get(photo.url, { responseType: 'stream' });

            // Generate filename based on public_id or just random
            const filename = `${photo.public_id.split('/').pop()}.jpg`;

            archive.append(response.data, { name: filename });
        }

        archive.finalize();

    } catch (error) {
        console.error("Zip Error:", error);
        res.status(500).send('Could not generate zip');
    }
};

const cloudinary = require('../utils/cloudinary');

// @desc    Delete project and all photos
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Find all photos
        const photos = await Photo.find({ project: project._id });

        // Delete from Cloudinary
        for (const photo of photos) {
            if (photo.public_id) {
                await cloudinary.uploader.destroy(photo.public_id);
            }
        }

        // Delete photos from DB
        await Photo.deleteMany({ project: project._id });

        // Delete project
        await project.deleteOne();

        res.json({ message: 'Project removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createProject, getProjects, getProjectById, submitSelection, downloadSelected, deleteProject };

