const express = require('express');
const router = express.Router();
const FileController = require('../controllers/fileController');

// File routes
router.post('/upload', FileController.uploadFiles);
router.get('/', FileController.getFiles);
router.get('/:fileId', FileController.getFileById);
router.delete('/:fileId', FileController.deleteFile);

module.exports = router;
