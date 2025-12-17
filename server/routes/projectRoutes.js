const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, submitSelection, downloadSelected, deleteProject } = require('../controllers/projectController');



const { protect } = require('../middleware/authMiddleware');

// Re-route into other resource routers
const photoRouter = require('./photoRoutes');
router.use('/:projectId/photos', photoRouter);

router.route('/').post(protect, createProject).get(protect, getProjects);

// Public access for client view
router.route('/:id').get(getProjectById).delete(protect, deleteProject);
router.route('/:id/submit').put(submitSelection);


router.route('/:id/download-selected').get(protect, downloadSelected);

module.exports = router;


