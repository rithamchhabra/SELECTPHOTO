const express = require('express');
const router = express.Router({ mergeParams: true });
const { uploadPhotos, getProjectPhotos, toggleSelection, deletePhoto } = require('../controllers/photoController');


const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.route('/')
    .post(protect, upload.array('photos'), uploadPhotos)
    .get(getProjectPhotos);

router.put('/:id/selection', toggleSelection);
router.delete('/:id', protect, deletePhoto);

module.exports = router;


